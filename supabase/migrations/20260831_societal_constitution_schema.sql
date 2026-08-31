-- alparai_schema.sql

-- 1. Anti-Sybil & Reputation System (user_reputation)
CREATE TABLE user_reputation (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    reputation_score INT DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
    is_sybil_suspect BOOLEAN DEFAULT FALSE,
    trust_level VARCHAR(20) DEFAULT 'neutral', -- 'trusted', 'neutral', 'suspicious', 'banned'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reputation_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_reputation(user_id) ON DELETE CASCADE,
    change_amount INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agora-T (Jury System)
CREATE TABLE jury_cases (
    case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'voting', 'resolved', 'dismissed'
    target_user_id UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE jurors (
    case_id UUID REFERENCES jury_cases(case_id) ON DELETE CASCADE,
    juror_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (case_id, juror_id)
);

CREATE TABLE jury_votes (
    vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES jury_cases(case_id) ON DELETE CASCADE,
    juror_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_decision VARCHAR(20) NOT NULL, -- 'guilty', 'innocent', 'abstain'
    vote_weight INT DEFAULT 1, -- Can be influenced by reputation
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (case_id, juror_id)
);

-- 3. Wall of Shame (Utanç Duvarı)
CREATE TABLE wall_of_shame_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES jury_cases(case_id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    penalty_details TEXT,
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Triggers for automatic updates

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_reputation_modtime
BEFORE UPDATE ON user_reputation
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Function to handle Anti-Sybil Logic
CREATE OR REPLACE FUNCTION check_sybil_suspect()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reputation_score < 20 THEN
        NEW.is_sybil_suspect = TRUE;
        NEW.trust_level = 'suspicious';
    ELSIF NEW.reputation_score >= 80 THEN
        NEW.is_sybil_suspect = FALSE;
        NEW.trust_level = 'trusted';
    ELSE
        NEW.is_sybil_suspect = FALSE;
        NEW.trust_level = 'neutral';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_check_sybil_suspect
BEFORE UPDATE ON user_reputation
FOR EACH ROW EXECUTE PROCEDURE check_sybil_suspect();