-- Table for storing schemes
CREATE TABLE IF NOT EXISTS user_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  scheme_name text NOT NULL,
  description text,
  category text,
  benefit text,
  eligibility boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_schemes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own schemes
CREATE POLICY "Users can view own schemes" ON user_schemes
  FOR SELECT USING (auth.uid()::text = user_id);

-- Create policy for users to insert their own schemes
CREATE POLICY "Users can insert own schemes" ON user_schemes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Insert dummy data
INSERT INTO user_schemes (user_id, scheme_name, description, category, benefit, eligibility)
VALUES
('user_123', 'Education Loan Scheme', 'Get government-backed loans for higher studies with interest subsidy.', 'Education', '₹5,00,000 loan at 0% interest', true),
('user_123', 'Housing Subsidy (PMAY)', 'First home loan subsidy under PM Awas Yojana.', 'Housing', '₹2,67,000 subsidy', true),
('user_123', 'Startup Loan (Stand-Up India)', 'Government support for entrepreneurs with business loans.', 'Entrepreneurship', 'Up to ₹10,00,000 loan', true),
('user_123', 'National Scholarship', 'Scholarship for meritorious students pursuing higher education.', 'Education', '₹12,000 annual stipend', true),
('user_123', 'Healthcare Insurance Scheme', 'Free health insurance coverage under Ayushman Bharat.', 'Health', '₹5,00,000 coverage', false);
