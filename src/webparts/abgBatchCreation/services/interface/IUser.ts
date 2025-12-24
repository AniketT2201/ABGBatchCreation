export interface IUserProps {
    Id?: number;
    Name?: string;
    Title?: string;
    LoginName?: string;
    Email?: string;
    EMail?: string; // added extra to bind on edit
 
    PrincipleType?: number;
    IsSiteAdmin?: boolean;
    UserId?: { NameId?: string; NameIdIssuer?: string; };
}
 
export const UserProps = {
    Id: 0,
    Name: '',
    Title: '',
    LoginName: '',
    Email: '',
    EMail: '',
 
    PrincipleType: 0,
    IsSiteAdmin: false,
    UserId: { NameId: '', NameIdIssuer: '', }
}