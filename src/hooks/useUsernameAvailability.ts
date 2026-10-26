import { useEffect, useState } from 'react';
import { registerSchema } from '../types';
import { authService } from '../services/auth.service';
import { detectAuthPayload } from '../utils/authInputFeedback';

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export function useUsernameAvailability(value: string, enabled: boolean) {
  const parsed = registerSchema.shape.username.safeParse(value);
  const username = parsed.success && !detectAuthPayload(value) ? parsed.data : '';
  const [result, setResult] = useState<{ username: string; status: Status }>({ username: '', status: 'idle' });
  useEffect(() => {
    if (!enabled || !username) return;
    const controller = new AbortController();
    setResult({ username, status: 'checking' });
    const timer = window.setTimeout(async () => {
      try {
        const response = await authService.usernameAvailability(username, controller.signal);
        if (!controller.signal.aborted) setResult({ username, status: response.available ? 'available' : 'taken' });
      } catch {
        if (!controller.signal.aborted) setResult({ username, status: 'error' });
      }
    }, 450);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [enabled, username]);
  const status: Status = !enabled || !username ? 'idle' : result.username === username ? result.status : 'checking';
  return { username, status };
}
