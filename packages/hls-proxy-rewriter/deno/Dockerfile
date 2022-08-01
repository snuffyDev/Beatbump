FROM denoland/deno:1.18.1

WORKDIR /app

# Prefer not to run as root.
USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
# Uncomment the following two lines if you have a deps.ts file
#COPY deps.ts .
#RUN deno cache deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache --reload --lock=lock.json index.ts

CMD ["run", "--cached-only", "--allow-net", "index.ts"]