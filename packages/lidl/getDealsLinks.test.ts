import { getDealsLink } from "./getDealsLink"

test('Get current deals link from landing page', async () => {
  expect(await getDealsLink()).toBe('/c/billiger-montag/a10006065')
})