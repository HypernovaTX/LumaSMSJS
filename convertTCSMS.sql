/**
  This SQL Query converts the existing DB from TCSMS (written by Retriever II) TO LumaSMS
  This query should be executed ONLY once, please aware some of the codes are messy but are the most efficient upon testing
*/
USE `lumasms_test`;

/** SECTION 1 - Generate new database for each of the submission by merging tsms_resources and tsms_res_TYPE */
/* Sprites */
CREATE TABLE `tsms_submission_sprites` AS
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_gfx` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 1
;
ALTER TABLE `tsms_submission_sprites` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);
ALTER TABLE `tsms_submission_sprites` DROP `eid`;
ALTER TABLE `tsms_submission_sprites` CHANGE `old` `old` INT(1) NOT NULL DEFAULT '0';
ALTER TABLE `tsms_submission_sprites` CHANGE `file` `file` VARCHAR(256) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;

/* Games */
CREATE TABLE `tsms_submission_games` AS
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_games` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 2
;
ALTER TABLE `tsms_submission_games` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);
ALTER TABLE `tsms_submission_games` CHANGE `old` `old` INT(1) NOT NULL DEFAULT '0';
ALTER TABLE `tsms_submission_games` CHANGE `file` `file` VARCHAR(256) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;

/* Hacks */
CREATE TABLE `tsms_submission_hacks` AS
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_hacks` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 7
;
ALTER TABLE `tsms_submission_hacks` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);
ALTER TABLE `tsms_submission_hacks` CHANGE `old` `old` INT(1) NOT NULL DEFAULT '0';
ALTER TABLE `tsms_submission_hacks` CHANGE `file` `file` VARCHAR(256) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;

/* Reviews */
CREATE TABLE `tsms_submission_reviews` AS
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_reviews` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 3
  LEFT JOIN `tsms_resources` rg ON rg.rid = z.gid && r.type = 2
  LEFT JOIN `tsms_submission_games` g ON g.eid = rg.eid
;
ALTER TABLE `tsms_submission_reviews` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);
ALTER TABLE `tsms_submission_reviews` ADD `type` INT NOT NULL DEFAULT '0' AFTER `score`;
UPDATE `tsms_submission_reviews` SET type = 1;
UPDATE `tsms_submission_reviews` SET type = 2 WHERE gid = 34891;
ALTER TABLE `tsms_submission_reviews` CHANGE `old` `old` INT(1) NOT NULL DEFAULT '0';

/* How-tos */
CREATE TABLE `tsms_submission_howtos` AS
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_howtos` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 4
;
ALTER TABLE `tsms_submission_howtos` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);
ALTER TABLE `tsms_submission_howtos` DROP `eid`;
ALTER TABLE `tsms_submission_howtos` CHANGE `old` `old` INT(1) NOT NULL DEFAULT '0';
ALTER TABLE `tsms_submission_howtos` CHANGE `file` `file` VARCHAR(256) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;

/* Sounds */
CREATE TABLE `tsms_submission_sounds` AS
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_sounds` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 5
;
ALTER TABLE `tsms_submission_sounds` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);
ALTER TABLE `tsms_submission_sounds` DROP `eid`;
ALTER TABLE `tsms_submission_sounds` CHANGE `old` `old` INT(1) NOT NULL DEFAULT '0';
ALTER TABLE `tsms_submission_sounds` CHANGE `file` `file` VARCHAR(256) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;

/* Misc */
CREATE TABLE `tsms_submission_misc` AS
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_misc` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 6
;
ALTER TABLE `tsms_submission_misc` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);
ALTER TABLE `tsms_submission_misc` DROP `eid`;
ALTER TABLE `tsms_submission_misc` CHANGE `old` `old` INT(1) NOT NULL DEFAULT '0';
ALTER TABLE `tsms_submission_misc` CHANGE `file` `file` VARCHAR(256) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;

/* Updates (version) */
ALTER TABLE `tsms_version` ADD `data` TEXT NOT NULL AFTER `old`, ADD `decision` VARCHAR(128) NOT NULL AFTER `data`;
ALTER TABLE `tsms_version` CHANGE `old` `old` INT(11) NOT NULL DEFAULT '0';
ALTER TABLE `tsms_version` CHANGE `change` `message` VARCHAR(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL;
ALTER TABLE `tsms_version` ADD `in_queue` INT(2) NOT NULL DEFAULT '0' AFTER `decision`;

/* Scheduled for deletion */
CREATE TABLE `tsms_votes` ( 
  `voteid` INT NOT NULL AUTO_INCREMENT , 
  `type` INT(2) NOT NULL , 
  `update` INT(1) NOT NULL , 
  `uid` INT(10) NOT NULL , 
  `rid` INT(10) NOT NULL , 
  `decision` INT(1) NOT NULL , 
  `message` TEXT NOT NULL , 
  `date` INT(10) NOT NULL , 
  PRIMARY KEY (`voteid`)
);

/****************************************************************/

/** SECTION 2 - Update tables that relies on tsms_resources by adding type/sub_type (which submission table) and id (submittion ID, tied to submission type) */
/* Comments */
ALTER TABLE `tsms_comments` ADD `old` INT NOT NULL AFTER `hash`;
ALTER TABLE `tsms_comments` ADD `sub_type` INT NOT NULL AFTER `hash`;
ALTER TABLE `tsms_comments` ADD INDEX(`old`);
ALTER TABLE `tsms_comments` ADD INDEX(`sub_type`);
UPDATE `tsms_comments` SET old = 1;
UPDATE `tsms_comments` c SET sub_type = (SELECT type FROM `tsms_resources` WHERE rid = c.rid);
UPDATE `tsms_comments` c SET c.rid = (
  CASE c.sub_type/* GOOD LORD, WHAT HAVE I DONE?!? */
    WHEN 1
      THEN (SELECT z.id FROM `tsms_submission_sprites` z WHERE z.rid = c.rid)
    WHEN 2
      THEN (SELECT z.id FROM `tsms_submission_games` z WHERE z.rid = c.rid)
    WHEN 3
      THEN (SELECT z.id FROM `tsms_submission_reviews` z WHERE z.rid = c.rid)
    WHEN 4
      THEN (SELECT z.id FROM `tsms_submission_howtos` z WHERE z.rid = c.rid)
    WHEN 5
      THEN (SELECT z.id FROM `tsms_submission_sounds` z WHERE z.rid = c.rid)
    WHEN 6
      THEN (SELECT z.id FROM `tsms_submission_misc` z WHERE z.rid = c.rid)
    WHEN 7
      THEN (SELECT z.id FROM `tsms_submission_hacks` z WHERE z.rid = c.rid)
  END
)
WHERE c.type = 1 && c.sub_type > 0;
UPDATE `tsms_comments` SET rid = 0 WHERE type = 1 && sub_type = 0;

/* Version (submission update history) */
ALTER TABLE `tsms_version` ADD `type` INT NOT NULL AFTER `date`;
ALTER TABLE `tsms_version` ADD `old` INT NOT NULL AFTER `type`;
ALTER TABLE `tsms_version` ADD INDEX(`type`);
ALTER TABLE `tsms_version` ADD INDEX(`old`);
UPDATE `tsms_version` SET old = 1;
UPDATE `tsms_version` c SET type = (SELECT type FROM `tsms_resources` WHERE rid = c.rid);

UPDATE `tsms_version` c SET c.rid = (
  CASE c.type /* THIS IS GETTING OUT OF HAND! NOW THERE'S 2 OF THEM! */
    WHEN 1
      THEN (SELECT z.id FROM `tsms_submission_sprites` z WHERE z.rid = c.rid)
    WHEN 2
      THEN (SELECT z.id FROM `tsms_submission_games` z WHERE z.rid = c.rid)
    WHEN 3
      THEN (SELECT z.id FROM `tsms_submission_reviews` z WHERE z.rid = c.rid)
    WHEN 4
      THEN (SELECT z.id FROM `tsms_submission_howtos` z WHERE z.rid = c.rid)
    WHEN 5
      THEN (SELECT z.id FROM `tsms_submission_sounds` z WHERE z.rid = c.rid)
    WHEN 6
      THEN (SELECT z.id FROM `tsms_submission_misc` z WHERE z.rid = c.rid)
    WHEN 7
      THEN (SELECT z.id FROM `tsms_submission_hacks` z WHERE z.rid = c.rid)
  END
) WHERE c.type > 0;
UPDATE `tsms_version` SET rid = 0 WHERE type = 0;

ALTER TABLE `tsms_bookmarks` ADD INDEX(`uid`);
ALTER TABLE `tsms_bookmarks` ADD INDEX(`rid`);
ALTER TABLE `tsms_bookmarks` ADD INDEX(`type`);
UPDATE `tsms_bookmarks` c SET c.rid = (
  CASE c.type /* THREE, take it or leave it. ~ Patrick probably. */
    WHEN 1
      THEN (SELECT z.id FROM `tsms_submission_sprites` z WHERE z.rid = c.rid)
    WHEN 2
      THEN (SELECT z.id FROM `tsms_submission_games` z WHERE z.rid = c.rid)
    WHEN 3
      THEN (SELECT z.id FROM `tsms_submission_reviews` z WHERE z.rid = c.rid)
    WHEN 4
      THEN (SELECT z.id FROM `tsms_submission_howtos` z WHERE z.rid = c.rid)
    WHEN 5
      THEN (SELECT z.id FROM `tsms_submission_sounds` z WHERE z.rid = c.rid)
    WHEN 6
      THEN (SELECT z.id FROM `tsms_submission_misc` z WHERE z.rid = c.rid)
    WHEN 7
      THEN (SELECT z.id FROM `tsms_submission_hacks` z WHERE z.rid = c.rid)
  END
) WHERE c.type > 0;
DELETE FROM `tsms_bookmarks` WHERE rid = 0;

/****************************************************************/

/* SECTION 3 - User related items*/
/* Create a table that is used to log username changes */
CREATE TABLE `mfgg_mainsite`.`tsms_username_change` (
  `unrid` INT NOT NULL AUTO_INCREMENT , 
  `uid` INT NOT NULL DEFAULT '0' , 
  `old_username` VARCHAR(32) NOT NULL DEFAULT '' , 
  `new_username` VARCHAR(32) NOT NULL DEFAULT '' , 
  `date` INT(16) NOT NULL DEFAULT '0' , 
  PRIMARY KEY (`unrid`)
);

/* add a column to the user table for avatar file uploads */
ALTER TABLE `tsms_users` ADD `avatar_file` VARCHAR(256) NULL DEFAULT NULL AFTER `new_password`;
ALTER TABLE `tsms_users` ADD `banner` VARCHAR(256) NULL DEFAULT NULL AFTER `avatar_file`;
ALTER TABLE `tsms_users` ADD `banner_file` VARCHAR(256) NULL DEFAULT NULL AFTER `banner`;
ALTER TABLE `tsms_users` ADD `birthday` VARCHAR(10) NULL DEFAULT NULL AFTER `banner_file`;
ALTER TABLE `tsms_users` ADD `birthday_privacy` INT(2) NULL DEFAULT NULL AFTER `birthday`;
ALTER TABLE `tsms_users` ADD `location` VARCHAR(128) NULL DEFAULT NULL AFTER `birthday_privacy`;
ALTER TABLE `tsms_users` ADD `country` VARCHAR(64) NULL DEFAULT NULL AFTER `location`;
ALTER TABLE `tsms_users` ADD `pronoun` VARCHAR(16) NULL DEFAULT 'Undisclosed' AFTER `country`;
ALTER TABLE `tsms_users` ADD `title` VARCHAR(128) NULL DEFAULT NULL AFTER `pronoun`;
ALTER TABLE `tsms_users` ADD `bio` VARCHAR(512) NULL DEFAULT NULL AFTER `title`;
ALTER TABLE `tsms_users` ADD `signature` VARCHAR(1024) NULL DEFAULT NULL AFTER `bio`;
ALTER TABLE `tsms_users` ADD `favorite_game` VARCHAR(64) NULL DEFAULT NULL AFTER `signature`;
ALTER TABLE `tsms_users` ADD `switch_code` VARCHAR(32) NULL DEFAULT NULL AFTER `favorite_game`;