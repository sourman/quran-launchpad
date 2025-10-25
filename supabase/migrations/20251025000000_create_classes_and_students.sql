-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  monthly_price NUMERIC(10, 2) NOT NULL CHECK (monthly_price >= 0),
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  stripe_payment_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'paused')),
  subscribed_since TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes
CREATE POLICY "Institution admins can view their classes"
  ON public.classes FOR SELECT
  TO authenticated
  USING (
    institution_id IN (
      SELECT institution_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'institution_admin'
    )
  );

CREATE POLICY "Institution admins can insert their classes"
  ON public.classes FOR INSERT
  TO authenticated
  WITH CHECK (
    institution_id IN (
      SELECT institution_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'institution_admin'
    )
  );

CREATE POLICY "Institution admins can update their classes"
  ON public.classes FOR UPDATE
  TO authenticated
  USING (
    institution_id IN (
      SELECT institution_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'institution_admin'
    )
  );

CREATE POLICY "Institution admins can delete their classes"
  ON public.classes FOR DELETE
  TO authenticated
  USING (
    institution_id IN (
      SELECT institution_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'institution_admin'
    )
  );

-- RLS Policies for students
CREATE POLICY "Institution admins can view students in their classes"
  ON public.students FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM public.classes
      WHERE institution_id IN (
        SELECT institution_id FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'institution_admin'
      )
    )
  );

CREATE POLICY "Service role can insert students"
  ON public.students FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update students"
  ON public.students FOR UPDATE
  TO service_role
  USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_classes_institution_id ON public.classes(institution_id);
CREATE INDEX idx_students_class_id ON public.students(class_id);
CREATE INDEX idx_students_stripe_subscription_id ON public.students(stripe_subscription_id);
