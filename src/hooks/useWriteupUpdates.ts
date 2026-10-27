import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '../utils/socket';

export function useWriteupUpdates() {
  const client = useQueryClient();
  useEffect(() => {
    const refresh = () => {
      for (const queryKey of [['writeups'], ['writeup'], ['challenges'], ['challenge-writeups']]) {
        void client.invalidateQueries({ queryKey });
      }
    };
    socketService.on('writeupsUpdate', refresh);
    socketService.on('connect', refresh);
    return () => { socketService.off('writeupsUpdate', refresh); socketService.off('connect', refresh); };
  }, [client]);
}
