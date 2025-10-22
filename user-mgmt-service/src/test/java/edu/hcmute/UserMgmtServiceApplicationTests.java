package edu.hcmute;

import edu.hcmute.exception.UserException;
import edu.hcmute.model.User;
import edu.hcmute.outbound.UserOutboundApi;
import org.assertj.core.util.DateUtil;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;


@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UserMgmtServiceApplicationTests {
    static User newUser = null;
    static String token = null;
    static String propertyOwnerGroupId = null;
    static String brokersGroupId = null;
    static String agentsGroupId = null;
    @Autowired
    private UserOutboundApi userOutboundApi;

    @BeforeAll
    public static void init() {
        newUser = new User();
        newUser.setFirstName("Capy");
        newUser.setLastName("Bara");
        newUser.setEmail("capybara@lol.com");
        newUser.setUsername("capybara");
        token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0S2FKVEdKRWxMS0N0ZHc1SVFrOEJ6OGRCd2tmQmVnR3lEd1NZVEhOWFpJIn0.eyJleHAiOjE3NjAyMzgzNDgsImlhdCI6MTc2MDIzNjU0OCwianRpIjoidHJydGNjOjU2Y2FmZDZlLTU3YWYtNjRlNC0zNDY5LWM2ODM0OWFlNzMwMCIsImlzcyI6Imh0dHA6Ly8xMjcuMC4wLjE6ODA4MS9yZWFsbXMvcGljbWEiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiYTk1NGZlNDgtYWYxNy00MjcwLWE0NWUtNjQ4ZmY3Nzc5YmZlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYmFvdmlldC1pbnN1cmVyIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJkZWZhdWx0LXJvbGVzLXBpY21hIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbIm1hbmFnZS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE3Mi4xOC4wLjEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC1iYW92aWV0LWluc3VyZXIiLCJjbGllbnRBZGRyZXNzIjoiMTcyLjE4LjAuMSIsImNsaWVudF9pZCI6ImJhb3ZpZXQtaW5zdXJlciJ9.B-aMM_N0SojfaNEY0A-gv2SzqPdZko360EJQSqjkJwhixDzzibaiXmWxUlqVwGzHkyALIZiKsr7HWUVwjxiSJbqbT7Cf_s_WQWZFY7q5tukWba47vY4fBeJwg6avRIZ6MNiZxarHYIuAvxANUNZOXVA31NXp7WvRvZbLXHMUMkcI32TATV8Elr4FBloCkqvFz1IjwoWi7_7Le7pr6YEyv1rzWStWb9Pv-LOFzPP_rllo5MX3RmnrqO-xOTQvJXQwvpWd5q2MbAE-Sb0henzIPtPIj1DRzfSPh99zbPLkLxhdBeOwy0V9r1XRRSmJ14JZBZ8Tyto8JUrHqeUM1Za1CA";
        agentsGroupId = "1a142694-4296-41fa-a475-8f384c84e373";
        brokersGroupId = "3a9546ac-5c1d-4323-92a0-f858a6619304";
        propertyOwnerGroupId = "163e8a2c-8788-4bfc-bff8-e0d349bc9ac2";
    }

    @Disabled
    @Test
    void contextLoads() {
    }

    @Disabled
    @Test
    public void testGetAllUsers() throws UserException {
        userOutboundApi.getAllUsers(token);
    }

    @Test
    @Order(1)
    public void testCreatePropertyOwnerUser() {
        newUser.setUsername(newUser.getUsername() + DateUtil.now().getTime() % 10);
        newUser.setEmail(newUser.getEmail() + DateUtil.now().getTime() % 10);
        newUser = userOutboundApi.createUser(newUser, token);
        assertThat(newUser);
        assertThat(newUser.getId());
        assertThat(newUser.getGroupId());
    }

    @Test
    @Order(2)
    public void testCreateBrokerUser() {
        newUser.setUsername(newUser.getUsername() + DateUtil.now().getTime() % 10);
        newUser.setEmail(newUser.getEmail() + DateUtil.now().getTime() % 10);
        newUser.setGroupId(brokersGroupId);
        newUser = userOutboundApi.createUser(newUser, token);
        assertThat(newUser);
        assertThat(newUser.getId());
        assertThat(newUser.getGroupId());
    }

    @Test
    @Order(3)
    public void testCreateAgentUser() {
        newUser.setUsername(newUser.getUsername() + DateUtil.now().getTime() % 10);
        newUser.setEmail(newUser.getEmail() + DateUtil.now().getTime() % 10);
        newUser.setGroupId(agentsGroupId);
        newUser = userOutboundApi.createUser(newUser, token);
        assertThat(newUser);
        assertThat(newUser.getId());
        assertThat(newUser.getGroupId());
    }

    @Test
    @Order(4)
    public void testGetAllPropertyOwnerMembers() {
        List<User> membersOfGroup = userOutboundApi.getAllMembersOfGroup(propertyOwnerGroupId, token);
        assertThat(membersOfGroup);
        Assertions.assertFalse(membersOfGroup.isEmpty());
    }

    @Test
    @Order(5)
    public void testGetAllBrokerMembers() {
        List<User> membersOfGroup = userOutboundApi.getAllMembersOfGroup(brokersGroupId, token);
        assertThat(membersOfGroup);
        Assertions.assertFalse(membersOfGroup.isEmpty());
    }

    @Test
    @Order(6)
    public void testGetAllAgentMembers() {
        List<User> membersOfGroup = userOutboundApi.getAllMembersOfGroup(agentsGroupId, token);
        assertThat(membersOfGroup);
        Assertions.assertFalse(membersOfGroup.isEmpty());
    }

    @Disabled
    @Test
    public void testDeprovisionUser() {
        boolean isDeprovisioned = userOutboundApi.deprovisioningUser(newUser.getId(), newUser.getGroupId(), token);
        assertThat(isDeprovisioned);
    }
}