import React, { Fragment, useState } from "react";
import { FiExternalLink } from "@react-icons/all-files/fi/FiExternalLink";
import { FiMoreVertical } from "@react-icons/all-files/fi/FiMoreVertical";
import styled from "styled-components";
import { DynamicIcon } from "../icons";
import { SSRPopover } from "../SSRPopover";
import { ArrowContainer } from "react-tiny-popover";

export interface DockerEntity {
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

export const PopoverContainer = styled.div`
  border-radius: 6px;
  background: white;
  display: flex;
  flex-direction: column;
  width: 160px;
  box-shadow: 7px 7px 15px #d9d9d9, -7px -7px 15px #ffffff;
`;

export const PopoverEntity = styled.div`
  padding: 6px;
  display: flex;
`;

export const Separator = styled.div`
  height: 1px;
  background-color: #f2f4f4;
  margin-left: 18px;
  margin-right: 18px;
`;

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Popover: React.FC<{ entities: DockerEntity[] }> = ({
  entities,
}) => {
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

export const Container = styled.a`
  display: flex;
  position: relative;
  text-decoration: none;
  padding: 6px;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 7px 7px 15px #d9d9d9, -7px -7px 15px #ffffff;

  color: black;
`;

export const Icon = styled.div`
  margin-right: 6px;
  display: flex;
  justify-content: center;
`;

export const Text = styled.p`
  margin: 0;
`;

export const Title = styled.p`
  margin-top: 8px;
  margin-bottom: 8px;
`;
export const SmallMargins = styled(Text)`
  margin-top: 4px;
  margin-bottom: 0px;
`;
export const Small = styled(Text)`
  margin-top: 2px;
  font-size: 12px;
  color: grey;
`;
export const Muted = styled(Text)`
  color: lightgrey;
`;

interface StatusBarProps {
  status: DockerTagProps["status"];
}

export const StatusBar = styled.div<StatusBarProps>`
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

export const TagInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 0 6px;
`;

export const ExternalLinkContainer = styled.div`
  display: flex;
`;

export const ChildrenIconContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
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
  const [isEnabled, setEnabled] = useState(false);
  return (
    <>
      <SSRPopover
        isOpen={isEnabled}
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
          onMouseOver={() => setEnabled(true)}
          onMouseLeave={() => setEnabled(false)}
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
