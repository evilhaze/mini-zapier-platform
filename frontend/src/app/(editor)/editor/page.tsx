import { redirect } from 'next/navigation';

/**
 * Editor is a mode for a specific workflow, not a standalone destination.
 * Redirect to Workflows so the user can pick a workflow and open it in the editor.
 */
export default function EditorLandingPage() {
  redirect('/workflows');
}

