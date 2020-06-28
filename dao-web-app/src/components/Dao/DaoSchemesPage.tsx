import { IDAOState, Scheme } from "@daostack/client";
import Loading from "components/Shared/Loading";
import withSubscription, { ISubscriptionProps } from "components/Shared/withSubscription";
import UnknownSchemeCard from "components/Dao/UnknownSchemeCard";
import Analytics from "lib/analytics";
import { KNOWN_SCHEME_NAMES, PROPOSAL_SCHEME_NAMES } from "lib/schemeUtils";
import { Page } from "pages";
import * as React from "react";
import { BreadcrumbsItem } from "react-breadcrumbs-dynamic";
import { RouteComponentProps } from "react-router-dom";
// import * as Sticky from "react-stickynode";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import * as css from "./DaoSchemesPage.scss";
import ProposalSchemeCard from "./ProposalSchemeCard";
import SimpleSchemeCard from "./SimpleSchemeCard";
import { withTranslation } from 'react-i18next';


const Fade = ({ children, ...props }: any) => (
  <CSSTransition
    {...props}
    timeout={1000}
    classNames={{
      enter: css.fadeEnter,
      enterActive: css.fadeEnterActive,
      exit: css.fadeExit,
      exitActive: css.fadeExitActive,
    }}
  >
    {children}
  </CSSTransition>
);

type IExternalProps = {
  daoState: IDAOState;
} & RouteComponentProps<any>;

type IProps = IExternalProps & ISubscriptionProps<Scheme[]>;

class DaoSchemesPage extends React.Component<IProps, null> {

  public componentDidMount() {
    Analytics.track("Page View", {
      "Page Name": Page.DAOSchemes,
      "DAO Address": this.props.daoState.address,
      "DAO Name": this.props.daoState.name,
    });
  }

  public render() {
    //@ts-ignore
    const { t } = this.props;
    const { data } = this.props;
    const dao = this.props.daoState;
    const allSchemes = data;
    console.log("SCHEMES DATA: ", data)
    // const contributionReward = allSchemes.filter((scheme: Scheme) => scheme.staticState.name === "ContributionReward");
    const knownSchemes = allSchemes.filter((scheme: Scheme) => scheme.staticState.name !== "UGenericScheme" && scheme.staticState.name !== "ContributionReward" && KNOWN_SCHEME_NAMES.indexOf(scheme.staticState.name) >= 0);
    const unknownSchemes = allSchemes.filter((scheme: Scheme) =>  KNOWN_SCHEME_NAMES.indexOf(scheme.staticState.name) === -1 );
    const allKnownSchemes = [/* ...contributionReward,*/ ...knownSchemes];
    const schemeCardsHTML = (
      <TransitionGroup>
        { allKnownSchemes.map((scheme: Scheme) => (
          <Fade key={"scheme " + scheme.id}>
            {PROPOSAL_SCHEME_NAMES.includes(scheme.staticState.name)
              ?
              <ProposalSchemeCard dao={dao} scheme={scheme} />
              : <SimpleSchemeCard dao={dao} scheme={scheme} />
            }
          </Fade>
        ))
        }
  
        {
          //@ts-ignore
        !unknownSchemes ? "" :
          <Fade key={"schemes unknown"}>
            <UnknownSchemeCard
            //@ts-ignore
             schemes={unknownSchemes} />
          </Fade>
        }
      </TransitionGroup>
    );

    return (
      <div className={css.wrapper}>
        <BreadcrumbsItem to={"/dao/" + dao.address}>{dao.name}</BreadcrumbsItem>

        {/* <Sticky enabled top={50} innerZ={10000}> */}
        <h2>{t("sidebar.applications")}</h2>
        {/* </Sticky> */}
        {(allKnownSchemes.length + unknownSchemes.length) === 0
          ? <div>
            <img src="/assets/images/meditate.svg" />
            <div>
              {t('schemas.noSchemas')}
            </div>
          </div>
          :
          <div className={css.allSchemes}>{schemeCardsHTML}</div>
        }
      </div>
    );
  }
}
//@ts-ignore
const DaoSchemaWithTranslation = withTranslation()(DaoSchemesPage)

const DaoSchemesPageWithSub = withSubscription({
  wrappedComponent: DaoSchemaWithTranslation,
  loadingComponent: <Loading/>,
  errorComponent: (props) => <span>{props.error.message}</span>,
  checkForUpdate: [],
  createObservable: (props: IExternalProps) => {
    const dao = props.daoState.dao;
    return dao.schemes({ where: { isRegistered: true } }, { fetchAllData: true, subscribe: true });
  },
});
//@ts-ignore
export default DaoSchemesPageWithSub
