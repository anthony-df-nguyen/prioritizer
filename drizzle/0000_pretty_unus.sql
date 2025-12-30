CREATE TABLE `decision_drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`scale_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`weight` integer NOT NULL,
	`created_on` text NOT NULL,
	`updated_on` text NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`archived_on` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`scale_id`) REFERENCES `scoring_scales`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `decision_drivers_project_id_idx` ON `decision_drivers` (`project_id`);--> statement-breakpoint
CREATE INDEX `decision_drivers_scale_id_idx` ON `decision_drivers` (`scale_id`);--> statement-breakpoint
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
CREATE TABLE `scoring_scales` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`key` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_on` text NOT NULL,
	`updated_on` text NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`archived_on` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `scoring_scales_project_id_idx` ON `scoring_scales` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `scoring_scales_project_name_unique` ON `scoring_scales` (`project_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `scoring_scales_project_key_unique` ON `scoring_scales` (`project_id`,`key`);--> statement-breakpoint
CREATE TABLE `scoring_scale_options` (
	`id` text PRIMARY KEY NOT NULL,
	`scale_id` text NOT NULL,
	`label` text NOT NULL,
	`value` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_on` text NOT NULL,
	`updated_on` text NOT NULL,
	FOREIGN KEY (`scale_id`) REFERENCES `scoring_scales`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `scoring_scale_options_scale_id_idx` ON `scoring_scale_options` (`scale_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `scoring_scale_options_scale_label_unique` ON `scoring_scale_options` (`scale_id`,`label`);