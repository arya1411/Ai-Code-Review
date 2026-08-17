import { inngest } from '../client';

export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    name: "Hello World",
    triggers: [{ event: "test/hello.world" }],
  },
  async ({ event }: { event: { data?: { email?: string } } }) => {
    const email = event.data?.email ?? "World";
    return { message: `Hello ${email}!` };
  }
);