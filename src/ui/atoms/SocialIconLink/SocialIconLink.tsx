import React, {useMemo} from 'react';
import {theme} from "../../../GlobalStyles";
import {MEDIUM_URL, TWITTER_URL} from "../../../utils/constants";

/**
 *
 * @param {React.PropsWithChildren<ISocialIconLink>} props
 * @return {JSX.Element}
 * @constructor
 */
const SocialIconLink: React.FC<ISocialIconLink> = (props) => {

  const link = useMemo(() => {
    switch (props.type) {
      case "medium":
        return MEDIUM_URL;
      case "twitter":
        return TWITTER_URL;
    }
  }, [props.type]);

  return (
    <a href={link} target={"_blank"} style={{margin: theme.spacing(2)}}>
      <img src={`/img/login_social_icons/${props.type}.png`}/>
    </a>
  );
};

export interface ISocialIconLink {
  type: "twitter" | "medium"
}

export default SocialIconLink;
