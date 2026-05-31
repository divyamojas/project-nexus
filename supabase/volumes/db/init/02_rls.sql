-- Row Level Security for all public tables.
-- service_role (used by FastAPI backend) bypasses RLS automatically.
-- These policies govern direct PostgREST / client access.
-- Idempotent: DROP IF EXISTS before each CREATE.

-- ── profiles ──────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete"  ON public.profiles;

-- Any authenticated user can read profiles (needed to display book owners, borrowers, etc.)
CREATE POLICY "profiles_select"  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert"  ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update"  ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_delete"  ON public.profiles FOR DELETE TO authenticated USING (id = auth.uid());

-- ── books_catalog ─────────────────────────────────────────────────────────────
ALTER TABLE public.books_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_select" ON public.books_catalog;
DROP POLICY IF EXISTS "catalog_insert" ON public.books_catalog;

-- Catalog is read/create by any authenticated user; updates managed by backend (service_role)
CREATE POLICY "catalog_select" ON public.books_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalog_insert" ON public.books_catalog FOR INSERT TO authenticated WITH CHECK (true);

-- ── books ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "books_select" ON public.books;
DROP POLICY IF EXISTS "books_insert" ON public.books;
DROP POLICY IF EXISTS "books_update" ON public.books;
DROP POLICY IF EXISTS "books_delete" ON public.books;

-- Any authenticated user can browse all books (status filtering is app-level)
CREATE POLICY "books_select" ON public.books FOR SELECT TO authenticated USING (true);
CREATE POLICY "books_insert" ON public.books FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "books_update" ON public.books FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "books_delete" ON public.books FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── book_requests ─────────────────────────────────────────────────────────────
ALTER TABLE public.book_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests_select" ON public.book_requests;
DROP POLICY IF EXISTS "requests_insert" ON public.book_requests;
DROP POLICY IF EXISTS "requests_update" ON public.book_requests;
DROP POLICY IF EXISTS "requests_delete" ON public.book_requests;

CREATE POLICY "requests_select" ON public.book_requests FOR SELECT TO authenticated USING (requested_by = auth.uid() OR requested_to = auth.uid());
CREATE POLICY "requests_insert" ON public.book_requests FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid());
CREATE POLICY "requests_update" ON public.book_requests FOR UPDATE TO authenticated USING (requested_by = auth.uid() OR requested_to = auth.uid());
CREATE POLICY "requests_delete" ON public.book_requests FOR DELETE TO authenticated USING (requested_by = auth.uid());

-- ── book_loans ────────────────────────────────────────────────────────────────
-- RLS already enabled on this table; just add policies.
DROP POLICY IF EXISTS "loans_select" ON public.book_loans;
DROP POLICY IF EXISTS "loans_update" ON public.book_loans;

-- Only lender and borrower can see their loans
CREATE POLICY "loans_select" ON public.book_loans FOR SELECT TO authenticated USING (lender_id = auth.uid() OR borrower_id = auth.uid());
-- Loans are created only by the backend (service_role); no INSERT policy for authenticated
CREATE POLICY "loans_update" ON public.book_loans FOR UPDATE TO authenticated USING (lender_id = auth.uid() OR borrower_id = auth.uid());

-- ── transfers ─────────────────────────────────────────────────────────────────
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transfers_select" ON public.transfers;
DROP POLICY IF EXISTS "transfers_update" ON public.transfers;

-- Transfers are created by the backend when a request is accepted; no INSERT policy for authenticated
CREATE POLICY "transfers_select" ON public.transfers FOR SELECT TO authenticated USING (from_user = auth.uid() OR to_user = auth.uid());
CREATE POLICY "transfers_update" ON public.transfers FOR UPDATE TO authenticated USING (from_user = auth.uid() OR to_user = auth.uid());

-- ── return_requests ───────────────────────────────────────────────────────────
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "return_req_select" ON public.return_requests;
DROP POLICY IF EXISTS "return_req_insert" ON public.return_requests;
DROP POLICY IF EXISTS "return_req_update" ON public.return_requests;

-- Borrower (requested_by) or lender of the underlying loan can see return requests
CREATE POLICY "return_req_select" ON public.return_requests FOR SELECT TO authenticated
  USING (
    requested_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.book_loans
      WHERE id = return_requests.loan_id AND lender_id = auth.uid()
    )
  );
-- Only the borrower initiates a return request
CREATE POLICY "return_req_insert" ON public.return_requests FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid());
-- Only the lender can approve/reject
CREATE POLICY "return_req_update" ON public.return_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.book_loans
      WHERE id = return_requests.loan_id AND lender_id = auth.uid()
    )
  );

-- ── saved_books ───────────────────────────────────────────────────────────────
ALTER TABLE public.saved_books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_select" ON public.saved_books;
DROP POLICY IF EXISTS "saved_insert" ON public.saved_books;
DROP POLICY IF EXISTS "saved_delete" ON public.saved_books;

CREATE POLICY "saved_select" ON public.saved_books FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "saved_insert" ON public.saved_books FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "saved_delete" ON public.saved_books FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── book_reviews ──────────────────────────────────────────────────────────────
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "book_reviews_select" ON public.book_reviews;
DROP POLICY IF EXISTS "book_reviews_insert" ON public.book_reviews;
DROP POLICY IF EXISTS "book_reviews_update" ON public.book_reviews;
DROP POLICY IF EXISTS "book_reviews_delete" ON public.book_reviews;

CREATE POLICY "book_reviews_select" ON public.book_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "book_reviews_insert" ON public.book_reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "book_reviews_update" ON public.book_reviews FOR UPDATE TO authenticated USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "book_reviews_delete" ON public.book_reviews FOR DELETE TO authenticated USING (reviewer_id = auth.uid());

-- ── user_reviews ──────────────────────────────────────────────────────────────
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_reviews_select" ON public.user_reviews;
DROP POLICY IF EXISTS "user_reviews_insert" ON public.user_reviews;
DROP POLICY IF EXISTS "user_reviews_update" ON public.user_reviews;
DROP POLICY IF EXISTS "user_reviews_delete" ON public.user_reviews;

CREATE POLICY "user_reviews_select" ON public.user_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_reviews_insert" ON public.user_reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "user_reviews_update" ON public.user_reviews FOR UPDATE TO authenticated USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "user_reviews_delete" ON public.user_reviews FOR DELETE TO authenticated USING (reviewer_id = auth.uid());

-- ── libraries ─────────────────────────────────────────────────────────────────
ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "libraries_select" ON public.libraries;

-- Any authenticated user can read libraries; create/update/delete is backend-only (service_role)
CREATE POLICY "libraries_select" ON public.libraries FOR SELECT TO authenticated USING (true);

-- ── feedback ──────────────────────────────────────────────────────────────────
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_insert" ON public.feedback;

-- Authenticated users can submit feedback; reading is backend-only (service_role)
CREATE POLICY "feedback_insert" ON public.feedback FOR INSERT TO authenticated WITH CHECK (true);

-- ── crud_event_logs ───────────────────────────────────────────────────────────
-- Audit log written by backend triggers (service_role). No client access.
ALTER TABLE public.crud_event_logs ENABLE ROW LEVEL SECURITY;

-- ── request_logs ──────────────────────────────────────────────────────────────
-- HTTP request log written by backend middleware (service_role). No client access.
ALTER TABLE public.request_logs ENABLE ROW LEVEL SECURITY;

-- ── schema_migrations ─────────────────────────────────────────────────────────
-- Internal migration tracking. No client access.
ALTER TABLE public.schema_migrations ENABLE ROW LEVEL SECURITY;
