import styled from "@emotion/styled";
import { faTimes } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTrimmedCoordinates } from "../../helpers/coordinates";
import { useAppDispatch } from "../../hooks";
import { UserLocation } from "./storage";
import { removeLocation } from "./userSlice";
import { LocationItemLink, LocationLabel } from "../../shared/locationStyles";

const RemoveIcon = styled(FontAwesomeIcon)`
  margin-left: auto;
  font-size: 1.5rem;
  padding: 1rem;
  box-sizing: content-box;
  opacity: 0.5;
  transform: scale(0.95);

  transition: 100ms ease-out;
  transition-property: opacity, transform;

  &:hover {
    color: red;
  }
`;

const StyledLink = styled(LocationItemLink)`
  height: 4rem;

  &:hover,
  &:focus,
  &:focus-visible {
    ${RemoveIcon} {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

interface LocationProps {
  location: UserLocation;
}

export default function Location({ location }: LocationProps) {
  const dispatch = useAppDispatch();

  function remove(e: React.MouseEvent, location: UserLocation) {
    e.stopPropagation();
    e.preventDefault();

    dispatch(removeLocation(location));
  }

  return (
    <StyledLink to={`/${getTrimmedCoordinates(location.lat, location.lon)}`}>
      <LocationLabel>{location.label}</LocationLabel>
      <RemoveIcon icon={faTimes} onClick={(e) => remove(e, location)} />
    </StyledLink>
  );
}
