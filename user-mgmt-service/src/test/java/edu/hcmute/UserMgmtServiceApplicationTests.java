package edu.hcmute;

import edu.hcmute.models.User;
import edu.hcmute.outbound.UserOutboundApi;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UserMgmtServiceApplicationTests {
    static User newUser = null;
    String token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0S2FKVEdKRWxMS0N0ZHc1SVFrOEJ6OGRCd2tmQmVnR3lEd1NZVEhOWFpJIn0.eyJleHAiOjE3NTkzOTE2NDQsImlhdCI6MTc1OTM4OTg0NCwianRpIjoidHJydGNjOjcwOGM3ODFhLTY1NjktZWE3Yy03NzllLWI2ZDdmNGQ0MzA1MiIsImlzcyI6Imh0dHA6Ly8xMjcuMC4wLjE6ODA4MS9yZWFsbXMvcGljbWEiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiYTk1NGZlNDgtYWYxNy00MjcwLWE0NWUtNjQ4ZmY3Nzc5YmZlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYmFvdmlldC1pbnN1cmVyIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJkZWZhdWx0LXJvbGVzLXBpY21hIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbIm1hbmFnZS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE3Mi4xOC4wLjEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC1iYW92aWV0LWluc3VyZXIiLCJjbGllbnRBZGRyZXNzIjoiMTcyLjE4LjAuMSIsImNsaWVudF9pZCI6ImJhb3ZpZXQtaW5zdXJlciJ9.amkikusYL4QrHvRE3ntdJcG7h7fXnZjawj9X_0mr3adEXKK6LprILIGaiMyAOPV5JH2pzepdBtWTo1R_jR73Sib-A8V4wY0tsI7E5UM46tFEv8ZfzGz5oIxGRnE_w5dWjKQYqfLd3PuV9OEttoR9Q12ltjXWj6CLt4F98r-uuahj-BSUZffGSFqvBU6zv9kLcRGckf0iK92RQDQieoLIsfolDx99Ryg1tZaFY74MWUO0qgCPPl4YSoJdJdTV-ENhSnVzOAl5adYF44H5S6uqMws1vAWQWOg87yELw_tZ3tEAnHII1fPDLFFRdLnmAPKge3pPty00sN_obA7vrIQIfA";
    @Autowired
    private UserOutboundApi userOutboundApi;

    @BeforeAll
    public static void init() {
        newUser = User.builder()
                .firstName("Capy")
                .lastName("Bara")
                .email("capybara@lol.com")
                .username("capybara")
                .build();
    }

    @Test
    void contextLoads() {
    }

    @Test
    @Order(3)
    public void testGetAllUsers() {
        userOutboundApi.getAllPropertyOwners(token);
    }

    @Test
    @Order(1)
    public void testCreateUser() {
        newUser = userOutboundApi.createUser(newUser, token);
        assertThat(newUser);
        assertThat(newUser.getUserId());
        assertThat(newUser.getGroupId());
    }

    @Test
    @Order(2)
    public void testDeprovisionUser() {
        boolean isDeprovisioned = userOutboundApi.deprovisioningUser(newUser.getUserId(), newUser.getGroupId(), token);
        assertThat(isDeprovisioned);
    }
}