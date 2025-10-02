package edu.hcmute;

import edu.hcmute.models.User;
import edu.hcmute.outbound.UserOutboundApi;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;


@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UserMgmtServiceApplicationTests {
    static User newUser = null;
    String token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0S2FKVEdKRWxMS0N0ZHc1SVFrOEJ6OGRCd2tmQmVnR3lEd1NZVEhOWFpJIn0.eyJleHAiOjE3NTk0MjA2MzEsImlhdCI6MTc1OTQxODgzMSwianRpIjoidHJydGNjOjllNzJkNzg3LTMwMWQtZTk2Ny0wNjdkLWIxMjg1MGIxYWU1YSIsImlzcyI6Imh0dHA6Ly8xMjcuMC4wLjE6ODA4MS9yZWFsbXMvcGljbWEiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiYTk1NGZlNDgtYWYxNy00MjcwLWE0NWUtNjQ4ZmY3Nzc5YmZlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYmFvdmlldC1pbnN1cmVyIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJkZWZhdWx0LXJvbGVzLXBpY21hIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbIm1hbmFnZS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE3Mi4xOC4wLjEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC1iYW92aWV0LWluc3VyZXIiLCJjbGllbnRBZGRyZXNzIjoiMTcyLjE4LjAuMSIsImNsaWVudF9pZCI6ImJhb3ZpZXQtaW5zdXJlciJ9.HmPchNc-2yThziVZTWCvh-F47pzqGNznqWLawDpQk-4WPrPfIS0koCmAD5VM5s9_-Bnuq_mkaLOfdCTARgi67l5ASxgWtYXkZxupj5e_r8bnE0qXyRqLRQEUZL089VGdBXJW9tl_Y71t3xN9B9471RUfS1VgJYaI62AbFni2TN-Qn7tAQDUl2H98rHrUhQlq-e9zTptt9DqtMXuCAOyBmWcEzeU8-XK5_azp-Jy_M8Xr-IS9aMKbf3l_8xpxYNanfPbZa0NJoAF3xs492vgumEEs_hEesTjGG_yM9W35fktAhamRfJJOkgu8yVG3gPdPecugaDfqrg5kvpphwyBHtw";
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

    //    @Test
    public void testGetAllUsers() {
        userOutboundApi.getAllUsers(token);
    }

    @Test
    @Order(2)
    public void testGetAllPropertyOwners() {
        List<User> propertyOwners = userOutboundApi.getAllPropertyOwners(token);
        assertThat(propertyOwners);
        Assertions.assertFalse(propertyOwners.isEmpty());
    }

    @Test
    @Order(1)
    public void testCreateUser() {
        newUser = userOutboundApi.createUser(newUser, token);
        assertThat(newUser);
        assertThat(newUser.getUserId());
        assertThat(newUser.getGroupId());
    }

    //    @Test
    public void testDeprovisionUser() {
        boolean isDeprovisioned = userOutboundApi.deprovisioningUser(newUser.getUserId(), newUser.getGroupId(), token);
        assertThat(isDeprovisioned);
    }
}