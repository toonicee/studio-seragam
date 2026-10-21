ALTER TABLE `categories` ADD `name_en` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `description_en` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `pages` ADD `title_en` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `pages` ADD `body_en` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `name_en` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `summary_en` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `description_en` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `details_en` text DEFAULT '' NOT NULL;