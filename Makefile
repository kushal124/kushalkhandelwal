.PHONY: build serve dev new-blog

build:
	npm run build

serve:
	npm run serve

dev:
	npm run dev

# Create a new blog post with date prefix
# Usage: make new-blog title="My Blog Title"
new-blog:
ifndef title
	$(error title is required. Usage: make new-blog title="My Blog Title")
endif
	@DATE=$$(date +%Y-%m-%d); \
	SLUG=$$(echo "$(title)" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-'); \
	FILENAME="blogs/$${DATE}-$${SLUG}.md"; \
	echo "---" > $$FILENAME; \
	echo "title: $(title)" >> $$FILENAME; \
	echo "date: \"$${DATE}\"" >> $$FILENAME; \
	echo "excerpt: " >> $$FILENAME; \
	echo "---" >> $$FILENAME; \
	echo "" >> $$FILENAME; \
	echo "Write your blog post here." >> $$FILENAME; \
	echo "Created: $$FILENAME"
