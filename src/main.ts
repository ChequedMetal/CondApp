import { bootstrapApplication } from '@angular/platform-browser';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';
import { provideRouter, withPreloading, PreloadAllModules, RouteReuseStrategy } from '@angular/router';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth }               from '@angular/fire/auth';
import { getFirestore, provideFirestore }     from '@angular/fire/firestore';

import { AppComponent }  from './app/app.component';
import { routes }        from './app/app.routes';
import { environment }   from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(()    => getAuth()),
    provideFirestore(() => getFirestore()),
  ]
});
