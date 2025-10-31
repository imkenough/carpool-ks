import { supabase } from '@/utils/supabase';
import { useState, useEffect } from 'react';

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data) {
        setUserId(data.user.id);
      }
    };

    fetchUser();
  }, []);

  return userId;
}
