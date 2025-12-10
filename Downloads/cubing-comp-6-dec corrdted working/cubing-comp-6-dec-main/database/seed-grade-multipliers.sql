-- =============================================
-- SEED: Grade Multipliers (Inverse Scale)
-- Lower grades earn more points to encourage participation
-- =============================================

INSERT INTO grade_multipliers (grade, multiplier, display_order, description) VALUES
('5', 2.0, 1, 'Grade 5 (Youngest) - 2.0x multiplier - Maximum encouragement')
ON CONFLICT (grade) DO UPDATE SET multiplier = 2.0, display_order = 1;

INSERT INTO grade_multipliers (grade, multiplier, display_order, description) VALUES
('6', 1.85, 2, 'Grade 6 - 1.85x multiplier')
ON CONFLICT (grade) DO UPDATE SET multiplier = 1.85, display_order = 2;

INSERT INTO grade_multipliers (grade, multiplier, display_order, description) VALUES
('7', 1.7, 3, 'Grade 7 - 1.7x multiplier')
ON CONFLICT (grade) DO UPDATE SET multiplier = 1.7, display_order = 3;

INSERT INTO grade_multipliers (grade, multiplier, display_order, description) VALUES
('8', 1.55, 4, 'Grade 8 - 1.55x multiplier')
ON CONFLICT (grade) DO UPDATE SET multiplier = 1.55, display_order = 4;

INSERT INTO grade_multipliers (grade, multiplier, display_order, description) VALUES
('9', 1.4, 5, 'Grade 9 - 1.4x multiplier')
ON CONFLICT (grade) DO UPDATE SET multiplier = 1.4, display_order = 5;

INSERT INTO grade_multipliers (grade, multiplier, display_order, description) VALUES
('10', 1.25, 6, 'Grade 10 - 1.25x multiplier')
ON CONFLICT (grade) DO UPDATE SET multiplier = 1.25, display_order = 6;

INSERT INTO grade_multipliers (grade, multiplier, display_order, description) VALUES
('11', 1.1, 7, 'Grade 11 - 1.1x multiplier')
ON CONFLICT (grade) DO UPDATE SET multiplier = 1.1, display_order = 7;

INSERT INTO grade_multipliers (grade, multiplier, display_order, description) VALUES
('12', 1.0, 8, 'Grade 12 (Oldest) - 1.0x multiplier - Baseline')
ON CONFLICT (grade) DO UPDATE SET multiplier = 1.0, display_order = 8;
