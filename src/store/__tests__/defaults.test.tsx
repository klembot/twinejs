import path from "node:path";
import fs from "node:fs";
import { builtins } from "../story-formats/defaults";

describe('Story format defaults', () => {
  it('should have valid URLs for all builtin formats', () => {
    const formats = builtins();

    // For each story format we think we have, check if the paths exist.
    formats.forEach(format => {
      // Check that the path exists
      const fullPath = path.join(__dirname, '../../../public', format.url);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  it('should have matching folder names and versions', () => {
    const formats = builtins();

    formats.forEach(format => {
      // Verify folder name matches expected pattern
      const expectedFolder = `${format.name.toLowerCase()}-${format.version}`;
      expect(format.url).toContain(expectedFolder);
    });
  });

  it('should have no duplicate format entries', () => {
    const formats = builtins();
    const uniqueKeys = new Set(
      formats.map(f => `${f.name}-${f.version}`)
    );
    
    expect(uniqueKeys.size).toBe(formats.length);
  });
});