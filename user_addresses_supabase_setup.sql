-- Create the user_addresses table
CREATE TABLE public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state_province TEXT,
  postal_code TEXT,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to manage their own addresses
CREATE POLICY "Users can manage their own addresses."
ON public.user_addresses FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a function to ensure only one default address per user
CREATE OR REPLACE FUNCTION public.set_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default IS TRUE THEN
    UPDATE public.user_addresses
    SET is_default = FALSE
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function before insert or update
CREATE TRIGGER enforce_single_default_address
BEFORE INSERT OR UPDATE ON public.user_addresses
FOR EACH ROW EXECUTE FUNCTION public.set_single_default_address();
