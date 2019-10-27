import { Component, NgZone } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Push, PushObject, PushOptions } from '@ionic-native/push/ngx';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { HomePage } from './home/home.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private push: Push,
    private router: Router,
    private navCtrl: NavController,
    private deeplinks: Deeplinks,
    private zone: NgZone
    ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // DeepLinkでコントロール
      // this.deeplinks.routeWithNavController(this.navCtrl, {
      this.deeplinks.route({
        '/home': "home",
      }).subscribe(match => {
        // match.$route - the route we matched, which is the matched entry from the arguments to route()
        // match.$args - the args passed in the link
        // match.$link - the full link data
        console.log('Successfully matched route', match);
        // this.router.navigateByUrl(match.$link.path);
        this.zone.run(() => {
          this.router.navigateByUrl(match.$route);
        });
      }, nomatch => {
        // nomatch.$link - the full link data
        console.error('Got a deeplink that didn\'t match', nomatch);
      });

      // Push
      this.push.createChannel({
        id: "PushPluginChannel",
        description: "default channel",
        // The importance property goes from 1 = Lowest, 2 = Low, 3 = Normal, 4 = High and 5 = Highest.
        importance: 5
       }).then(() => console.log('Channel created'));

      const options: PushOptions = {
        android: {},
        ios: {
            alert: 'true',
            badge: true,
            sound: 'false'
        },
        windows: {},
        browser: {
            pushServiceURL: 'http://push.api.phonegap.com/v1/push'
        }
      }

      // pushObject
      const pushObject: PushObject = this.push.init(options);

      // registration
      pushObject.on('registration').subscribe((registration: any) => {
        console.log("registrationId:" +  registration.registrationId)
      });

      // notification
      pushObject.on('notification').subscribe((notification: any) => {
        console.log("notification");
        console.log(notification);
        const dataStr = JSON.stringify(notification.additionalData);
        JSON.parse(dataStr, (key, value) => {
          if(key === "pinpoint.url") {
            console.log("key:" +  key);
            console.log("value:" + value);
            
            var restOfUrl = value;
            var separator = value.indexOf('://');
        
            if (separator !== -1) {
              restOfUrl = value.slice(separator + 3);
            } else {
              separator = value.indexOf(':/');
              if (separator !== -1) {
                restOfUrl = value.slice(separator + 2);
              }
            }
        
            var qs = restOfUrl.indexOf('?');
            if (qs > -1) {
              restOfUrl = restOfUrl.slice(0, qs);
            }
        
            var hs = restOfUrl.indexOf('#');
            if (hs > -1) {
              restOfUrl = restOfUrl.slice(0, hs);
            }

            console.log("restOfUrl:" + restOfUrl);

            var routeParts = restOfUrl.split('/');
            console.log("routeParts[0]:" + routeParts[0]);
            console.log("routeParts[1]:" + routeParts[1]);
            this.zone.run(() => {
              this.router.navigateByUrl(routeParts[1]);
            });

          }

        });
        // this.router.navigateByUrl('second');
        // this.navCtrl.navigateForward('second');
      });

    });
  }
}
