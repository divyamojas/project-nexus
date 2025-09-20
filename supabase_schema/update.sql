-- Function helpers for role-based administration ---------------------------------

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_uid uuid := auth.uid();
BEGIN
  IF current_uid IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = current_uid
      AND lower(u.email) = lower('myriad1703+superadmin@gmail.com')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.is_super_admin(), FALSE)
         OR EXISTS (
           SELECT 1
           FROM public.profiles p
           WHERE p.id = auth.uid()
             AND p.role IN ('admin', 'super_admin')
         );
$$;

-- Profiles role constraint + seed -------------------------------------------------

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check,
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'admin', 'super_admin'));

UPDATE public.profiles
SET role = 'user'
WHERE role IS NULL;

INSERT INTO public.profiles (id, username, role, first_name, last_name)
SELECT u.id,
       COALESCE(p.username, 'superadmin'),
       'super_admin',
       COALESCE(p.first_name, 'Super'),
       COALESCE(p.last_name, 'Admin')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE lower(u.email) = lower('myriad1703+superadmin@gmail.com')
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- RLS adjustments -----------------------------------------------------------------

ALTER POLICY "Users can request books"
ON public.book_requests
WITH CHECK (
  public.is_super_admin() OR (
    (auth.uid() = requested_by)
    AND (requested_by <> requested_to)
    AND (
      requested_to = (
        SELECT b.user_id
        FROM public.books AS b
        WHERE b.id = book_requests.book_id
      )
    )
  )
);

ALTER POLICY "Users can update relevant requests"
ON public.book_requests
WITH CHECK (
  public.is_super_admin() OR (
    ((auth.uid() = requested_by) OR (auth.uid() = requested_to) OR public.is_admin())
    AND (requested_by <> requested_to)
    AND (
      requested_to = (
        SELECT b.user_id
        FROM public.books AS b
        WHERE b.id = book_requests.book_id
      )
    )
  )
);

ALTER POLICY "Users can delete their own requests"
ON public.book_requests
USING (
  public.is_super_admin() OR (auth.uid() = requested_by)
);

ALTER POLICY "Users can view their book requests"
ON public.book_requests
USING (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = requested_by) OR (auth.uid() = requested_to)
);

ALTER POLICY "Allow borrower or lender to read"
ON public.book_loans
USING (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = lender_id) OR (auth.uid() = borrower_id)
);

CREATE POLICY "Admins can update loans"
ON public.book_loans
FOR UPDATE
USING (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = lender_id) OR (auth.uid() = borrower_id)
)
WITH CHECK (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = lender_id) OR (auth.uid() = borrower_id)
);

ALTER POLICY "Anyone can view available books"
ON public.books
USING (
  public.is_super_admin() OR public.is_admin() OR (archived = false)
);

ALTER POLICY "Users can manage their own books"
ON public.books
USING (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = user_id)
)
WITH CHECK (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = user_id)
);

ALTER POLICY "Only involved users can insert transfer"
ON public.transfers
WITH CHECK (
  public.is_super_admin() OR (
    ((auth.uid() = from_user) OR (auth.uid() = to_user))
    AND EXISTS (
      SELECT 1
      FROM public.book_requests AS br
      WHERE br.id = transfers.request_id
        AND br.book_id = transfers.book_id
        AND br.requested_by = transfers.to_user
        AND br.requested_to = transfers.from_user
        AND br.status = 'accepted'
    )
  )
);

ALTER POLICY "Only involved users can update transfer"
ON public.transfers
WITH CHECK (
  public.is_super_admin() OR (
    ((auth.uid() = from_user) OR (auth.uid() = to_user) OR public.is_admin())
    AND EXISTS (
      SELECT 1
      FROM public.book_requests AS br
      WHERE br.id = transfers.request_id
        AND br.book_id = transfers.book_id
        AND br.requested_by = transfers.to_user
        AND br.requested_to = transfers.from_user
    )
  )
);

ALTER POLICY "Users involved in transfer can view"
ON public.transfers
USING (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = from_user) OR (auth.uid() = to_user)
);

ALTER POLICY "Borrower or lender can read return requests"
ON public.return_requests
USING (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = requested_by) OR (
    auth.uid() IN (
      SELECT bl.lender_id
      FROM public.book_loans AS bl
      WHERE bl.id = return_requests.loan_id
    )
  )
);

ALTER POLICY "Borrower or lender can request return"
ON public.return_requests
WITH CHECK (
  public.is_super_admin() OR (
    (auth.uid() = requested_by)
    AND (
      auth.uid() IN (
        SELECT bl.borrower_id
        FROM public.book_loans AS bl
        WHERE bl.id = return_requests.loan_id
      )
      OR auth.uid() IN (
        SELECT bl.lender_id
        FROM public.book_loans AS bl
        WHERE bl.id = return_requests.loan_id
      )
    )
  )
);

ALTER POLICY "Only lender can update return status"
ON public.return_requests
WITH CHECK (
  public.is_super_admin() OR public.is_admin() OR (
    auth.uid() IN (
      SELECT bl.lender_id
      FROM public.book_loans AS bl
      WHERE bl.id = return_requests.loan_id
    )
  )
);

ALTER POLICY "Can save books for self"
ON public.saved_books
WITH CHECK (
  public.is_super_admin() OR (auth.uid() = user_id)
);

ALTER POLICY "Users can save books for themselves"
ON public.saved_books
WITH CHECK (
  public.is_super_admin() OR (auth.uid() = user_id)
);

ALTER POLICY "Can unsave own books"
ON public.saved_books
USING (
  public.is_super_admin() OR (auth.uid() = user_id)
);

ALTER POLICY "Users can remove their saved books"
ON public.saved_books
USING (
  public.is_super_admin() OR (auth.uid() = user_id)
);

ALTER POLICY "Can view own saved books"
ON public.saved_books
USING (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = user_id)
);

ALTER POLICY "Users can view their saved books"
ON public.saved_books
USING (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = user_id)
);

ALTER POLICY "Users can insert their own book reviews"
ON public.book_reviews
WITH CHECK (
  public.is_super_admin() OR (
    (auth.uid() = reviewer_id)
    AND EXISTS (
      SELECT 1
      FROM public.books b
      WHERE b.id = book_reviews.book_id
        AND b.user_id <> auth.uid()
    )
  )
);

ALTER POLICY "book_reviews_update_own"
ON public.book_reviews
WITH CHECK (
  public.is_super_admin() OR public.is_admin() OR (reviewer_id = auth.uid())
);

ALTER POLICY "book_reviews_delete_own"
ON public.book_reviews
USING (
  public.is_super_admin() OR public.is_admin() OR (reviewer_id = auth.uid())
);

ALTER POLICY "book_reviews_select_all"
ON public.book_reviews
USING (
  public.is_super_admin() OR public.is_admin() OR TRUE
);

ALTER POLICY "Users can review other users"
ON public.user_reviews
WITH CHECK (
  public.is_super_admin() OR (
    (auth.uid() = reviewer_id)
    AND (reviewer_id <> reviewee_id)
    AND EXISTS (
      SELECT 1
      FROM public.profiles AS p
      WHERE p.id = reviewee_id
    )
  )
);

ALTER POLICY "Reviewer and reviewee can view the review"
ON public.user_reviews
USING (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = reviewer_id) OR (auth.uid() = reviewee_id)
);

ALTER POLICY "Users can view their own profile"
ON public.profiles
USING (
  public.is_super_admin() OR public.is_admin() OR (auth.uid() = id)
);

ALTER POLICY "Users can update their own profile"
ON public.profiles
WITH CHECK (
  public.is_super_admin() OR (auth.uid() = id)
);

ALTER POLICY "Users can delete their own profile"
ON public.profiles
USING (
  public.is_super_admin() OR (auth.uid() = id)
);

ALTER POLICY "Users can insert their own profile"
ON public.profiles
WITH CHECK (
  public.is_super_admin() OR (auth.uid() = id)
);
