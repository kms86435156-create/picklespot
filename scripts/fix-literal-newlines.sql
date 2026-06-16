-- Fix literal '\n' strings in description fields
-- These should be actual newline characters (chr(10)), not the two-character string '\n'

-- Meetups
UPDATE meetups
SET description = REPLACE(description, '\n', chr(10))
WHERE description LIKE '%\n%';

-- Tournaments
UPDATE tournaments
SET description = REPLACE(description, '\n', chr(10))
WHERE description LIKE '%\n%';

-- Clubs
UPDATE clubs
SET description = REPLACE(description, '\n', chr(10))
WHERE description LIKE '%\n%';

-- Community posts
UPDATE community_posts
SET content = REPLACE(content, '\n', chr(10))
WHERE content LIKE '%\n%';

-- Club posts
UPDATE club_posts
SET content = REPLACE(content, '\n', chr(10))
WHERE content LIKE '%\n%';
