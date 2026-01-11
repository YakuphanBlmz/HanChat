
import re

line_from_dump = '6.08.2025 15:09 - HanımaĞa: selam arkadaşlarr'
# From debug dump, checking for invisible chars (Note: I can't easily paste invisible chars here but I will try to be robust)

patterns = [
    r"^(\d{1,2}\.\d{1,2}\.\d{4})\s+(\d{1,2}:\d{2})\s+-\s+(.*?):\s+(.*)$",
    r"^(\d{1,2}[\./]\d{1,2}[\./]\d{2,4})\s*,?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s+(.*?):\s+(.*)$"
]

print(f"Testing line: '{line_from_dump}'")
for i, p in enumerate(patterns):
    match = re.match(p, line_from_dump)
    print(f"Pattern {i}: {'MATCH' if match else 'FAIL'}")
    if match:
        print(f"Groups: {match.groups()}")

# Test with invisible char overlay if possible
# The dump showed: "3: 6.08.2025 15:09 - ‎HanımaĞa sizi ekledi" -> The LRM is before key names maybe?
# But the regex matches the START of the line.
# Let's test non-breaking space or similar.
line_dirty = "\u200e" + line_from_dump # Left-to-right mark
print(f"Testing dirty line: (LRM + line)")
for i, p in enumerate(patterns):
    match = re.match(p, line_dirty)
    print(f"Pattern {i}: {'MATCH' if match else 'FAIL'}")

# Regex to remove invisible chars
clean_line = re.sub(r'[\u200e\u200f\u202a-\u202e]', '', line_dirty)
print(f"Cleaned line matching: {'MATCH' if re.match(patterns[0], clean_line) else 'FAIL'}")
