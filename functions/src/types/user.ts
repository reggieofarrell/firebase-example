export interface IUser {
  cognito_user_id: string;
  email: string;
  gender: string;
  age: number;
  avatar: string;
  is_reviewer: boolean;
  is_interested_in_social: boolean;
  is_interested_in_economic: boolean;
  is_interested_in_international: boolean;
  is_interested_in_local_candidates: boolean;
  is_interested_in_state_candidates: boolean;
  is_interested_in_federal_candidates: boolean;
  is_interested_in_municipal_legislation: boolean;
  is_interested_in_state_legislation: boolean;
  is_interested_in_federal_legislation: boolean;
  zipcode: string;
  street_address: string;
  state: string;
  city: string;
  name: string;
  lat: string;
  lng: string;
  google_place_id: string;
  has_seen_tutorial: boolean;
  date_of_birth: string;
}
