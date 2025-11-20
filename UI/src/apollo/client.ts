import { InMemoryCache } from "@apollo/client";
import { ApolloClient, HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const httpLink = new HttpLink({
    uri: "http://localhost:8080/query",
});

// Auth link to inject Authorization header on each request
const authLink = new SetContextLink(({ headers }) => {
    const token = localStorage.getItem("authToken");
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

// Compose the links and create the Apollo Client
export const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink), // >= Combines the link with other links into a single composed link .
    cache: new InMemoryCache(),
});