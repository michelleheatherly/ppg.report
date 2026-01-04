import styled from "@emotion/styled";
import { Link } from "react-router-dom";

export const LocationContainer = styled.div`
  background-color: rgba(211, 211, 211, 0.043);
  border-radius: 1em;
  box-shadow: 0 0.25em 0.5em rgba(0, 0, 0, 0.7);
  padding: 0.5rem 0;
  backdrop-filter: blur(5px);

  @media (max-width: 600px) {
    border-radius: 0;
  }
`;

export const LocationLabel = styled.span`
  transition: transform 100ms ease-out;
  transform-origin: left center;
`;

export const LocationItemLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 2em;
  min-height: 4rem;
  transition: background-color 100ms ease-out;

  color: inherit;
  text-decoration: none !important;

  &:hover,
  &:focus,
  &:focus-visible {
    background-color: rgba(0, 0, 0, 0.1);

    ${LocationLabel} {
      transform: scale(1.015);
      font-weight: 500;
    }
  }
`;
