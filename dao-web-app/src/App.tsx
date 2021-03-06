import { initializeArc } from "arc";
import Loading from "components/Shared/Loading";
import AppContainer from "layouts/AppContainer";
import { sleep } from "lib/util";
import Error404 from "components/Errors/Error404";
import ErrorUncaught from "components/Errors/ErrorUncaught";
import * as React from "react";
import ReactGA from "react-ga";
import { Provider } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";
import { ThroughProvider } from "react-through";
import * as css from "./layouts/App.scss";
import { history, default as store } from "./configureStore";

export class App extends React.Component<{}, {
  arcIsInitialized: boolean;
  retryingArc: boolean;
  error?: string;
}> {
  constructor(props: {}) {
    super(props);
    this.state = {
      arcIsInitialized: false,
      retryingArc: false,
      error: undefined,
    };
  }

                
  private getPdfHtml = (filename: string): any => {
    window.location.href = `${window.location.protocol}//${window.location.host}/assets/${filename}`;
    return null;
  }

  private CookiePolicy = () => {
    return this.getPdfHtml("cookie_policy.pdf");
  }

  private PrivacyPolicy = () => {
    return this.getPdfHtml("privacy_policy.pdf");
  }

  public async componentDidMount (): Promise<void> {
    // Do this here because we need to have initialized Arc first.  This will
    // not create a provider for the app, rather will just initialize Arc with a
    // readonly provider with no account, internal only to it.
    const totalNumberOfAttempts = 3; /// we will try 3 times to init arc before actually throwing an error
    let numberOfAttempts = 0;
    let success = false;
    const initArc = async ()  => {
      success = await initializeArc();
      if (!success) {
        throw Error("Initialize arc failed for an unknown reason (see the console)...");
      }
      this.setState({ arcIsInitialized: true });
    };
    while (!success) {
      try {
        await initArc();
      } catch(err) {
        this.setState({ retryingArc: true });
        // eslint-disable-next-line no-console
        numberOfAttempts += 1;
        // retry
        if (numberOfAttempts >= totalNumberOfAttempts) {
          const msg = "Could not connect to the network; please retry later...";
          this.setState({ error: msg});
          throw Error(msg);
        }
        // eslint-disable-next-line no-console
        console.error("Could not connect..");
        // eslint-disable-next-line no-console
        console.error(err);
        // eslint-disable-next-line no-console
        console.log(`retrying (attempt ${numberOfAttempts} of ${totalNumberOfAttempts})`);
        await sleep(2000);
      }
    }
    
    console.log("-0000000000000000000--------------0000000000000000---------------", process.env);
    let GOOGLE_ANALYTICS_ID: string;
    switch (process.env.NODE_ENV) {
      case "production": {
        // the "real" id
        GOOGLE_ANALYTICS_ID = "UA-142546205-1";
        break;
      }
      default: {
        // the "test" id
        GOOGLE_ANALYTICS_ID = "UA-142546205-2";
      }
    }
    ReactGA.initialize(GOOGLE_ANALYTICS_ID);
    history.listen((location: any): void => {
      ReactGA.pageview(location.pathname + location.search);
    });
  }

  public render(): RenderOutput {
    if (this.state.error) {
      return <ErrorUncaught errorMessage={this.state.error} />;

    }
    if (!this.state.arcIsInitialized) {
      return (
        <div className={css.waitingToInitContainer}>
          { this.state.retryingArc ?
            <div className={css.waitingToInitMessage}>Waiting to connect to the blockchain.  If this is taking a while, please ensure that you have a good internet connection.</div> : ""
          }
          <Loading/>
        </div>
      );
    } else  {
      return (
        <Provider store={store}>
          <ThroughProvider>
            <ConnectedRouter history={history}>
              <Switch>
                <Route path="/cookie-policy" component={this.CookiePolicy}/>
                <Route path="/privacy-policy" component={this.PrivacyPolicy}/>
                <Route path="/" component={AppContainer}/>
                <Route component={Error404} />
                <Redirect from="/*" to="/Error404" />
              </Switch>
            </ConnectedRouter>
          </ThroughProvider>
        </Provider>
      );
    }
  }
}
