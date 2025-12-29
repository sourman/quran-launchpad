-- Create a security definer function to count students per class
-- This bypasses RLS issues and is more efficient
CREATE OR REPLACE FUNCTION public.get_student_counts_for_classes(class_ids UUID[])
RETURNS TABLE(class_id UUID, student_count BIGINT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.class_id,
    COUNT(*)::BIGINT as student_count
  FROM public.students s
  INNER JOIN public.classes c ON s.class_id = c.id
  INNER JOIN public.user_roles ur ON c.institution_id = ur.institution_id
  WHERE s.class_id = ANY(class_ids)
    AND ur.user_id = auth.uid()
    AND ur.role = 'institution_admin'
  GROUP BY s.class_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_student_counts_for_classes(UUID[]) TO authenticated;


