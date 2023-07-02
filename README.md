# Important commands and stuff
```
php artisan serve
npm run dev
```

## Inertia SSR
[DOCS](https://inertiajs.com/server-side-rendering)


When deploying your SSR enabled app to production, you'll need to build both the client-side (app.js) and server-side bundles (ssr.js), and then run the SSR server as a background process, typically using a process monitoring tool such as Supervisor.
```
npm run build
```

```
php artisan inertia:start-ssr
```

To stop the SSR server, for instance when you deploy a new version of your website, run. Your process monitor (such as Supervisor) should be responsible for automatically restarting the SSR server after it has stopped.

```
php artisan inertia:stop-ssr
```
