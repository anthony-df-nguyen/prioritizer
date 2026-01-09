CREATE TABLE `decision_driver_scoring_options` (
	`driver_id` text NOT NULL,
	`scoring_option_id` text NOT NULL,
	FOREIGN KEY (`driver_id`) REFERENCES `decision_drivers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`scoring_option_id`) REFERENCES `scoring_scale_options`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `decision_driver_scoring_options_driver_id_idx` ON `decision_driver_scoring_options` (`driver_id`);--> statement-breakpoint
CREATE INDEX `decision_driver_scoring_options_scoring_option_id_idx` ON `decision_driver_scoring_options` (`scoring_option_id`);--> statement-breakpoint
CREATE TABLE `decision_drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`weight` integer NOT NULL,
	`created_on` text NOT NULL,
	`updated_on` text NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`archived_on` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `decision_drivers_project_id_idx` ON `decision_drivers` (`project_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_id` text NOT NULL,
	`description` text,
	`created_on` text NOT NULL,
	`updated_on` text NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`archived_on` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_short_id_unique` ON `projects` (`short_id`);--> statement-breakpoint
CREATE TABLE `scoring_scale_options` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`value` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_on` text NOT NULL,
	`updated_on` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `item_driver_scores` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`driver_id` text NOT NULL,
	`scoring_scale_option_id` text,
	`value` integer,
	`created_on` text NOT NULL,
	`updated_on` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`driver_id`) REFERENCES `decision_drivers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`scoring_scale_option_id`) REFERENCES `scoring_scale_options`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `item_driver_scores_item_id_idx` ON `item_driver_scores` (`item_id`);--> statement-breakpoint
CREATE INDEX `item_driver_scores_driver_id_idx` ON `item_driver_scores` (`driver_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `item_driver_scores_item_driver_unique` ON `item_driver_scores` (`item_id`,`driver_id`);--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_on` text NOT NULL,
	`updated_on` text NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`archived_on` text,
	`score` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `items_project_id_idx` ON `items` (`project_id`);--> statement-breakpoint
CREATE INDEX `items_archived_idx` ON `items` (`archived`);