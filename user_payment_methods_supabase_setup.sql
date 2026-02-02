-- Create the user_payment_methods table
CREATE TABLE public.user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_brand TEXT, -- e.g., 'Visa', 'Mastercard', 'American Express'
  last_four TEXT NOT NULL,
  expiration_month INTEGER NOT NULL,
  expiration_year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security (RLS) on the table
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users to manage their own payment methods
CREATE POLICY "Users can manage their own payment methods."
ON public.user_payment_methods FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION public.set_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default IS TRUE THEN
    UPDATE public.user_payment_methods
    SET is_default = FALSE
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function before insert or update
CREATE TRIGGER enforce_single_default_payment_method
BEFORE INSERT OR UPDATE ON public.user_payment_methods
FOR EACH ROW EXECUTE FUNCTION public.set_single_default_payment_method();
