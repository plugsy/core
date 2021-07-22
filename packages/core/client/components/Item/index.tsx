import React, { Fragment, useMemo, useState } from "react";
import { FiExternalLink } from "@react-icons/all-files/fi/FiExternalLink";
import { FiMoreVertical } from "@react-icons/all-files/fi/FiMoreVertical";
import { FaDocker } from "@react-icons/all-files/fa/FaDocker";
import { VscJson } from "@react-icons/all-files/vsc/VscJson";
import { HiOutlineGlobeAlt } from "@react-icons/all-files/hi/HiOutlineGlobeAlt";
import { BsQuestion } from "@react-icons/all-files/bs/BsQuestion";
import styled from "styled-components";
import { DynamicIcon } from "../icons";
import { SSRPopover } from "../SSRPopover";
import { ArrowContainer } from "react-tiny-popover";
import { getColor, getComponentTheme, Theme } from "../../theme";
import { useTheme } from "styled-components";

export type ItemThemable =
  | "PopoverContainer"
  | "PopoverEntity"
  | "Separator"
  | "TextContainer"
  | "Container"
  | "Icon"
  | "Text"
  | "SmallMargins"
  | "Small"
  | "Muted"
  | "StatusBar"
  | "TagInfo"
  | "ExternalLinkContainer"
  | "ExternalLinkContainerColumn"
  | "Margins"
  | "ExternalLinkContainerColumnSeparator";

const getItemTheme = (component: ItemThemable) =>
  getComponentTheme("Item", component);

interface ItemData {
  iconName?: string | null;
  iconPack?: string | null;
  text?: string;
  link?: string;
  status?: string;
  state: "GREEN" | "YELLOW" | "RED" | "GREY";
  connectorType: "DOCKER" | "RAW" | "WEBSITE";
}

export interface ItemProps extends ItemData {
  children: ItemData[];
}

const PopoverContainer = styled.div`
  border-radius: 6px;
  background: white;
  display: flex;
  flex-direction: column;
  width: 160px;
  box-shadow: 7px 7px 15px #d9d9d9, -7px -7px 15px #ffffff;

  ${getItemTheme("PopoverContainer")}
`;

const PopoverEntity = styled.div`
  padding: 6px;
  display: flex;

  ${getItemTheme("PopoverEntity")}
`;

const Separator = styled.div`
  height: 1px;
  background-color: #f2f4f4;
  margin-left: 18px;
  margin-right: 18px;

  ${getItemTheme("Separator")}
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${getItemTheme("TextContainer")}
`;

export const Popover: React.FC<{ entities: ItemData[] }> = ({ entities }) => {
  return (
    <PopoverContainer>
      {entities.map(({ text, iconName, status, iconPack, state }, i) => (
        <Fragment key={`child-${text}`}>
          <PopoverEntity>
            <StatusBar state={state} />
            <TagInfo>
              {iconName && iconPack ? (
                <Icon>
                  <DynamicIcon icon={iconName} iconPack={iconPack} />
                </Icon>
              ) : null}
              <TextContainer>
                <SmallMargins>{text}</SmallMargins>
                <Muted>
                  <Small>{status}</Small>
                </Muted>
              </TextContainer>
            </TagInfo>
          </PopoverEntity>
          {i !== entities.length - 1 ? <Separator /> : null}
        </Fragment>
      ))}
    </PopoverContainer>
  );
};

const Container = styled.a`
  display: flex;
  position: relative;
  text-decoration: none;
  padding: 6px;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 7px 7px 15px #d9d9d9, -7px -7px 15px #ffffff;

  color: black;

  ${getItemTheme("Container")}
`;

const Icon = styled.div`
  margin-right: 6px;
  display: flex;
  justify-content: center;

  ${getItemTheme("Icon")}
`;

const Text = styled.span`
  margin: 0;

  ${getItemTheme("Text")}
`;

const SmallMargins = styled(Text)`
  margin-top: 4px;
  margin-bottom: 0px;

  ${getItemTheme("SmallMargins")}
`;

const Small = styled(Text)`
  margin-top: 2px;
  font-size: 12px;
  color: grey;

  ${getItemTheme("Small")}
`;
const Muted = styled(Text)`
  color: lightgrey;

  ${getItemTheme("Muted")}
`;

interface StatusBarProps {
  state: ItemProps["state"];
}

const StatusBar = styled.div<StatusBarProps>`
  width: 6px;
  border-radius: 6px;
  background: ${({ state }) => getColor(state)};

  ${getItemTheme("StatusBar")}
`;

const TagInfo = styled.div`
  display: flex;
  min-height: 38px;
  align-items: center;
  padding: 0 6px;

  ${getItemTheme("TagInfo")}
`;

const ExternalLinkContainer = styled.div`
  display: flex;

  ${getItemTheme("ExternalLinkContainer")}
`;

const ExternalLinkContainerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  ${getItemTheme("ExternalLinkContainerColumn")}
`;

const ExternalLinkContainerColumnSeparator = styled.div`
  ${getItemTheme("ExternalLinkContainerColumnSeparator")}
`;

const Margins = styled.div`
  margin-top: 6px;
  margin-bottom: 6px;

  ${getItemTheme("Margins")}
`;

export const Item: React.FC<ItemProps> = ({
  iconName,
  iconPack,
  text,
  link,
  status,
  children,
  state,
  connectorType,
}) => {
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const ConnectorIcon = useMemo(
    () =>
      connectorType === "DOCKER"
        ? FaDocker
        : connectorType === "RAW"
        ? VscJson
        : connectorType === "WEBSITE"
        ? HiOutlineGlobeAlt
        : BsQuestion,
    [connectorType]
  );
  const theme = useTheme() as Theme;

  const arrowColor =
    theme?.components?.Item?.PopoverContainer?.background ?? "white";
  return (
    <>
      <SSRPopover
        isOpen={isPopoverOpen}
        positions={["top", "bottom", "left", "right"]}
        content={({ position, childRect, popoverRect }) => (
          <ArrowContainer
            position={position}
            childRect={childRect}
            popoverRect={popoverRect}
            arrowColor={arrowColor.toString()}
            arrowSize={10}
          >
            <Popover entities={children} />
          </ArrowContainer>
        )}
      >
        <Container
          target="_blank"
          href={link}
          onMouseOver={() => setPopoverOpen(children.length > 0)}
          onMouseLeave={() => setPopoverOpen(false)}
        >
          <StatusBar state={state} />
          <Margins>
            <TagInfo>
              {iconName && iconPack ? (
                <Icon>
                  <DynamicIcon icon={iconName} iconPack={iconPack} />
                </Icon>
              ) : null}
              <TextContainer>
                <SmallMargins>{text}</SmallMargins>
                <Small>{status}</Small>
              </TextContainer>
            </TagInfo>
          </Margins>
          <ExternalLinkContainerColumn>
            <ExternalLinkContainer>
              {link ? <FiExternalLink size={10} /> : null}
              {children.length > 0 ? <FiMoreVertical size={10} /> : null}
            </ExternalLinkContainer>
            <ExternalLinkContainerColumnSeparator>
              <ConnectorIcon size={10} />
            </ExternalLinkContainerColumnSeparator>
          </ExternalLinkContainerColumn>
        </Container>
      </SSRPopover>
    </>
  );
};
