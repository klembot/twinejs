import { join } from "node:path";
import { access } from "node:fs/promises";
import { builtins } from "../story-formats/defaults";

describe.each(builtins().map(format => [`${format.name} ${format.version}`, format]))('%s', (_, format) => {
  it('exists at the path set', async () => {
    await expect(access(join(__dirname, '../../../public', format.url))).resolves.toBeUndefined();
  });
});