-- Add share-related columns to chats table
ALTER TABLE public.chats
ADD COLUMN IF NOT EXISTS share_id UUID UNIQUE,
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE;

-- Add RLS policies for shared chats
CREATE POLICY "Anyone can view shared chats"
ON public.chats
FOR SELECT
USING (is_shared = true);

CREATE POLICY "Users can update their own chats"
ON public.chats
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for messages in shared chats
CREATE POLICY "Anyone can view messages in shared chats"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = messages.chat_id
    AND chats.is_shared = true
  )
); 