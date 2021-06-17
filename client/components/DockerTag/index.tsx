import React, { Fragment, useState } from "react";
import { FiExternalLink } from "@react-icons/all-files/fi/FiExternalLink";
import { FiMoreVertical } from "@react-icons/all-files/fi/FiMoreVertical";
import styled from "styled-components";
import { DynamicIcon } from "../icons";
import { SSRPopover } from "../SSRPopover";
import { ArrowContainer } from "react-tiny-popover";

interface DockerEntity {
  icon?: string;
  iconPack?: string;
  text?: string;
  link?: string;
  status: "GREEN" | "YELLOW" | "RED" | "GREY";
  state: string;
}

export interface DockerTagProps extends DockerEntity {
  children: DockerEntity[];
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

const Popover: React.FC<{ entities: DockerEntity[] }> = ({ entities }) => {
  return (
    <PopoverContainer>
      {entities.map(({ text, icon, status, iconPack, state }, i) => (
        <Fragment key={`child-${text}`}>
          <PopoverEntity>
            <StatusBar status={status} />
            <TagInfo>
              {icon && iconPack ? (
                <Icon>
                  <DynamicIcon icon={icon} iconPack={iconPack} />
                </Icon>
              ) : null}
              <TextContainer>
                <SmallMargins>{text}</SmallMargins>
                <Muted>
                  <Small>{state}</Small>
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
  status: DockerTagProps["status"];
}

const StatusBar = styled.div<StatusBarProps>`
  width: 6px;
  border-radius: 6px;
  background: ${({ status }) =>
    status === "GREEN"
      ? "green"
      : status === "YELLOW"
      ? "yellow"
      : status === "GREY"
      ? "grey"
      : "red"}; ;
`;

const TagInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 0 6px;
`;

const ExternalLinkContainer = styled.div`
  display: flex;
`;

const Margins = styled.div`
  margin-top: 6px;
  margin-bottom: 6px;
`;

export const DockerTag: React.FC<DockerTagProps> = ({
  icon,
  iconPack,
  text,
  link,
  status,
  children,
  state,
}) => {
  const [isPopoverOpen, setPopoverOpen] = useState(false);
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
          <StatusBar status={status} />
          <Margins>
            <TagInfo>
              {icon && iconPack ? (
                <Icon>
                  <DynamicIcon icon={icon} iconPack={iconPack} />
                </Icon>
              ) : null}
              <TextContainer>
                <SmallMargins>{text}</SmallMargins>
                <Small>{state}</Small>
              </TextContainer>
            </TagInfo>
          </Margins>
          {link ? (
            <ExternalLinkContainer>
              <FiExternalLink size={10} />
              {children.length > 0 ? <FiMoreVertical size={10} /> : null}
            </ExternalLinkContainer>
          ) : null}
        </Container>
      </SSRPopover>
    </>
  );
};
