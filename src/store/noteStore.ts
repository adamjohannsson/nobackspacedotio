import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  backspace_count: number;
}

interface DraftNote {
  title: string;
  content: string;
  backspace_count: number;
}

interface NoteState {
  notes: Note[];
  loading: boolean;
  currentBackspaceCount: number;
  fetchNotes: () => Promise<void>;
  createNote: (title: string, content: string, backspaceCount: number, noteId?: string) => Promise<void>;
  getFreeNotesCount: () => number;
  incrementBackspaceCount: () => void;
  resetBackspaceCount: () => void;
  setCurrentBackspaceCount: (count: number) => void;
  saveDraft: (note: DraftNote) => void;
  getDraft: () => DraftNote | null;
  clearDraft: () => void;
  checkPremiumStatus: () => Promise<boolean>;
}

const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: false,
  currentBackspaceCount: 0,
  fetchNotes: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    set({ notes: data || [], loading: false });
  },
  createNote: async (title, content, backspaceCount, noteId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    if (noteId) {
      // Update existing note
      const { error } = await supabase
        .from('notes')
        .update({
          title: title || 'Untitled',
          content,
          backspace_count: backspaceCount,
        })
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Create new note
      const { error } = await supabase
        .from('notes')
        .insert([
          {
            title: title || 'Untitled',
            content,
            user_id: user.id,
            backspace_count: backspaceCount,
          },
        ]);

      if (error) throw error;
    }

    get().fetchNotes();
    get().resetBackspaceCount();
    get().clearDraft();
  },
  getFreeNotesCount: () => {
    return get().notes.length;
  },
  incrementBackspaceCount: () => {
    set(state => ({ currentBackspaceCount: state.currentBackspaceCount + 1 }));
  },
  resetBackspaceCount: () => {
    set({ currentBackspaceCount: 0 });
  },
  setCurrentBackspaceCount: (count: number) => {
    set({ currentBackspaceCount: count });
  },
  saveDraft: (note: DraftNote) => {
    localStorage.setItem('draftNote', JSON.stringify(note));
  },
  getDraft: () => {
    const draft = localStorage.getItem('draftNote');
    return draft ? JSON.parse(draft) : null;
  },
  clearDraft: () => {
    localStorage.removeItem('draftNote');
  },
  checkPremiumStatus: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    if (error || !data) return false;
    return data.is_premium;
  }
}));

export { useNoteStore };