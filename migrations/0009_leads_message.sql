-- Adds a free-text field for the contact/demo forms (W2-328) — leads.
-- product/source_page already discriminate signup context; message is
-- the one field those two forms carry that no other lead source needs.

ALTER TABLE leads ADD COLUMN message TEXT;
