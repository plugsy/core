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
`;

const PopoverEntity = styled.div`
  padding: 6px;
  display: flex;
`;

const Separator = styled.div`
  height: 1px;
  background-color: #f2f4f4;
  margin-left: 18px;
  margin-right: 18px;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Popover: React.FC<{ entities: ItemData[] }> = ({ entities }) => {
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
`;

const Icon = styled.div`
  margin-right: 6px;
  display: flex;
  justify-content: center;
`;

const Text = styled.span`
  margin: 0;
`;

const SmallMargins = styled(Text)`
  margin-top: 4px;
  margin-bottom: 0px;
`;
const Small = styled(Text)`
  margin-top: 2px;
  font-size: 12px;
  color: grey;
`;
const Muted = styled(Text)`
  color: lightgrey;
`;

interface StatusBarProps {
  state: ItemProps["state"];
}

const StatusBar = styled.div<StatusBarProps>`
  width: 6px;
  border-radius: 6px;
  background: ${({ state }) =>
    state === "GREEN"
      ? "green"
      : state === "YELLOW"
      ? "yellow"
      : state === "GREY"
      ? "grey"
      : "red"};
`;

const TagInfo = styled.div`
  display: flex;
  min-height: 38px;
  align-items: center;
  padding: 0 6px;
`;

const ExternalLinkContainer = styled.div`
  display: flex;
`;

const ExternalLinkContainerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const ExternalLinkContainerColumnSeparator = styled.div``;

const Margins = styled.div`
  margin-top: 6px;
  margin-bottom: 6px;
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
            arrowColor="white"
            arrowSize={10}
          >
            <Popover entities={children} />
          </ArrowContainer>
        )}
      >
        <Container
          href={link}
          onMouseOver={() => setPopoverOpen(true)}
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
