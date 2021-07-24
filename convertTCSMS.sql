/**
  This SQL Query converts the existing DB from TCSMS (written by Retriever II) TO LumaSMS
  This query should be executed ONLY once, please aware some of the codes are messy but are the most efficient upon testing
*/

/** SECTION 1 - Generate new database for each of the submission by merging tsms_resources and tsms_res_TYPE */
/* Sprites */
CREATE TABLE `tsms_submission_sprites` AS 
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_gfx` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 1
;
ALTER TABLE `tsms_submission_sprites` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);
ALTER TABLE `tsms_submission_sprites` DROP `eid`;

/* Games */
CREATE TABLE `tsms_submission_games` AS 
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_games` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 2
;
ALTER TABLE `tsms_submission_games` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);

/* Hacks */
CREATE TABLE `tsms_submission_hacks` AS 
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_hacks` z 
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 7
;
ALTER TABLE `tsms_submission_hacks` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);

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

/* How-tos */
CREATE TABLE `tsms_submission_howtos` AS 
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_howtos` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 4
;
ALTER TABLE `tsms_submission_howtos` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);
ALTER TABLE `tsms_submission_howtos` DROP `eid`;

/* Sounds */
CREATE TABLE `tsms_submission_sounds` AS 
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_sounds` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 5
;
ALTER TABLE `tsms_submission_sounds` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);
ALTER TABLE `tsms_submission_sounds` DROP `eid`;

/* Misc */
CREATE TABLE `tsms_submission_misc` AS 
  SELECT r.uid, r.title, r.description, r.author_override, r.created, r.updated, r.queue_code, r.ghost, r.accept_date, r.update_accept_date, r.decision, r.catwords, z.*, r.rid, 1 as old
  FROM `tsms_res_misc` z
  LEFT JOIN `tsms_resources` r ON r.eid = z.eid && r.type = 6
;
ALTER TABLE `tsms_submission_misc` ADD `id` INT NOT NULL AUTO_INCREMENT FIRST, ADD PRIMARY KEY (`id`);
ALTER TABLE `tsms_submission_misc` DROP `eid`;


/** SECTION 2 - Update tables that relies on tsms_resources by adding type/sub_type (which submission table) and id (submittion ID, tied to submission type) */
/* Comments */
ALTER TABLE `tsms_comments` ADD `old` INT NOT NULL AFTER `hash`;
ALTER TABLE `tsms_comments` ADD `sub_type` INT NOT NULL AFTER `hash`;
ALTER TABLE `tsms_comments` ADD INDEX(`old`);
ALTER TABLE `tsms_comments` ADD INDEX(`sub_type`);
UPDATE `tsms_comments` SET old = 1;
UPDATE `tsms_comments` c SET sub_type = (SELECT type FROM `tsms_resources` WHERE rid = c.rid);
UPDATE `tsms_comments` c SET c.rid = (
  CASE /* GOOD LORD, WHAT HAVE I DONE?!? */
    WHEN c.sub_type = 1
    	THEN (SELECT z.id FROM `tsms_submission_sprites` z WHERE z.rid = c.rid)
    	ELSE CASE WHEN c.sub_type = 2
    		THEN (SELECT z.id FROM `tsms_submission_games` z WHERE z.rid = c.rid)
    		ELSE CASE WHEN c.sub_type = 3
    			THEN (SELECT z.id FROM `tsms_submission_reviews` z WHERE z.rid = c.rid)
    			ELSE CASE WHEN c.sub_type = 4
    				THEN (SELECT z.id FROM `tsms_submission_howtos` z WHERE z.rid = c.rid)
    				ELSE CASE WHEN c.sub_type = 5
    					THEN (SELECT z.id FROM `tsms_submission_sounds` z WHERE z.rid = c.rid)
    					ELSE CASE WHEN c.sub_type = 6
    						THEN (SELECT z.id FROM `tsms_submission_misc` z WHERE z.rid = c.rid)
    						ELSE CASE WHEN c.sub_type = 7
    							THEN (SELECT z.id FROM `tsms_submission_hacks` z WHERE z.rid = c.rid)
    						END
    					END
    				END
    			END
    		END
    	END
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
  CASE /* THIS IS GETTING OUT OF HAND! NOW THERE'S 2 OF THEM! */
    WHEN c.type = 1
    	THEN (SELECT z.id FROM `tsms_submission_sprites` z WHERE z.rid = c.rid)
    	ELSE CASE WHEN c.type = 2
    		THEN (SELECT z.id FROM `tsms_submission_games` z WHERE z.rid = c.rid)
    		ELSE CASE WHEN c.type = 3
    			THEN (SELECT z.id FROM `tsms_submission_reviews` z WHERE z.rid = c.rid)
    			ELSE CASE WHEN c.type = 4
    				THEN (SELECT z.id FROM `tsms_submission_howtos` z WHERE z.rid = c.rid)
    				ELSE CASE WHEN c.type = 5
    					THEN (SELECT z.id FROM `tsms_submission_sounds` z WHERE z.rid = c.rid)
    					ELSE CASE WHEN c.type = 6
    						THEN (SELECT z.id FROM `tsms_submission_misc` z WHERE z.rid = c.rid)
    						ELSE CASE WHEN c.type = 7
    							THEN (SELECT z.id FROM `tsms_submission_hacks` z WHERE z.rid = c.rid)
    						END
    					END
    				END
    			END
    		END
    	END
    END
) WHERE c.type > 0;
UPDATE `tsms_version` SET rid = 0 WHERE type = 0;

ALTER TABLE `tsms_bookmarks` ADD INDEX(`uid`);
ALTER TABLE `tsms_bookmarks` ADD INDEX(`rid`);
ALTER TABLE `tsms_bookmarks` ADD INDEX(`type`);
UPDATE `tsms_bookmarks` c SET c.rid = (
  CASE /* THREE, take it or leave it. ~ Patrick probably. */
    WHEN c.type = 1
    	THEN (SELECT z.id FROM `tsms_submission_sprites` z WHERE z.rid = c.rid)
    	ELSE CASE WHEN c.type = 2
    		THEN (SELECT z.id FROM `tsms_submission_games` z WHERE z.rid = c.rid)
    		ELSE CASE WHEN c.type = 3
    			THEN (SELECT z.id FROM `tsms_submission_reviews` z WHERE z.rid = c.rid)
    			ELSE CASE WHEN c.type = 4
    				THEN (SELECT z.id FROM `tsms_submission_howtos` z WHERE z.rid = c.rid)
    				ELSE CASE WHEN c.type = 5
    					THEN (SELECT z.id FROM `tsms_submission_sounds` z WHERE z.rid = c.rid)
    					ELSE CASE WHEN c.type = 6
    						THEN (SELECT z.id FROM `tsms_submission_misc` z WHERE z.rid = c.rid)
    						ELSE CASE WHEN c.type = 7
    							THEN (SELECT z.id FROM `tsms_submission_hacks` z WHERE z.rid = c.rid)
    						END
    					END
    				END
    			END
    		END
    	END
    END
) WHERE c.type > 0;
DELETE FROM `tsms_bookmarks` WHERE rid = 0;
