-- =============================================
-- SEED: Badges for Individual and School Achievements
-- =============================================

-- =============================================
-- INDIVIDUAL BADGES
-- =============================================

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'Lightning Solver',
  'Achieved a sub-20 second solve in 3x3x3',
  '⚡',
  'individual',
  'best_time',
  20000,
  'gold',
  10
);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'Steady Champion',
  'Completed an entire competition without any DNFs',
  '🎯',
  'individual',
  'zero_dnfs',
  1,
  'silver',
  8
);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'Rising Star',
  'Most improved average time compared to previous competition',
  '⭐',
  'individual',
  'improvement',
  15,
  'silver',
  8
);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'Finals Champion',
  'Achieved personal best time in the finals round',
  '🏆',
  'individual',
  'clutch_pb',
  1,
  'gold',
  10
);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'Quick Learner',
  'Achieved 3 consecutive solve improvements',
  '📚',
  'individual',
  'streak',
  3,
  'silver',
  8
);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'Personal Best Champion',
  'Set a new personal best',
  '✨',
  'individual',
  'set_pb',
  1,
  'bronze',
  5
);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'New Competitor',
  'Competed in your first cubing competition',
  '🌟',
  'individual',
  'first_competition',
  1,
  'bronze',
  3
);

-- =============================================
-- SCHOOL BADGES
-- =============================================

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'Full Team',
  'All registered students competed and completed all solves',
  '👥',
  'school',
  'all_competed',
  1,
  'silver',
  15
);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'Zero DNF School',
  'Entire school had zero DNFs in a round',
  '🟢',
  'school',
  'school_zero_dnfs',
  1,
  'gold',
  20
);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'Improvement Squad',
  'School average improved 15% or more from previous competition',
  '📈',
  'school',
  'school_improvement',
  15,
  'silver',
  15
);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'Top Performers',
  'School took 1st, 2nd, and 3rd place in a single grade',
  '🥇🥈🥉',
  'school',
  'podium_sweep',
  1,
  'gold',
  20
);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'School Champion',
  'School champion - Highest total points',
  '👑',
  'school',
  'rank',
  1,
  'gold',
  25
);

INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity, points)
VALUES
(
  'Team Stars',
  'School had 5+ personal bests in one competition',
  '✨',
  'school',
  'school_pbs',
  5,
  'silver',
  15
);
