-- Create games table
CREATE TABLE public.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    prize_pool DECIMAL(10,2) NOT NULL DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
    common_answers TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create entries table
CREATE TABLE public.entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    is_unique BOOLEAN,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(game_id, user_id)
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for games
CREATE POLICY "Games are viewable by everyone" 
    ON public.games FOR SELECT USING (true);

CREATE POLICY "Only admins can insert games" 
    ON public.games FOR INSERT 
    WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Only admins can update games" 
    ON public.games FOR UPDATE 
    USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for entries
CREATE POLICY "Users can view their own entries" 
    ON public.entries FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all entries" 
    ON public.entries FOR SELECT 
    USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own entries" 
    ON public.entries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Function to update entry uniqueness
CREATE OR REPLACE FUNCTION update_entry_uniqueness()
RETURNS TRIGGER AS $$
BEGIN
    -- Update is_unique for all entries in the same game
    UPDATE public.entries
    SET is_unique = (
        SELECT COUNT(*) = 1
        FROM public.entries e2
        WHERE e2.game_id = NEW.game_id
        AND LOWER(e2.answer) = LOWER(entries.answer)
    )
    WHERE game_id = NEW.game_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update uniqueness after insert/update
CREATE TRIGGER entry_uniqueness_trigger
    AFTER INSERT OR UPDATE ON public.entries
    FOR EACH ROW
    EXECUTE FUNCTION update_entry_uniqueness();

-- Function to automatically start next game
CREATE OR REPLACE FUNCTION check_and_start_next_game()
RETURNS TRIGGER AS $$
DECLARE
    next_game_id UUID;
BEGIN
    -- Mark current game as completed
    IF NEW.status = 'completed' THEN
        -- Find pending game
        SELECT id INTO next_game_id
        FROM public.games
        WHERE status = 'pending'
        AND id != NEW.id
        ORDER BY created_at ASC
        LIMIT 1;

        -- Activate the next game if found
        IF next_game_id IS NOT NULL THEN
            UPDATE public.games
            SET status = 'active',
                start_time = NOW()
            WHERE id = next_game_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-starting next game
CREATE TRIGGER auto_start_next_game
    AFTER UPDATE ON public.games
    FOR EACH ROW
    WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
    EXECUTE FUNCTION check_and_start_next_game();
