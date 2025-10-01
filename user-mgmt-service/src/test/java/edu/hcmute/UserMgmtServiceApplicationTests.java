package edu.hcmute;

import edu.hcmute.models.User;
import edu.hcmute.outbound.UserOutboundApi;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class UserMgmtServiceApplicationTests {
    String token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0S2FKVEdKRWxMS0N0ZHc1SVFrOEJ6OGRCd2tmQmVnR3lEd1NZVEhOWFpJIn0.eyJleHAiOjE3NTkzMzcwMzMsImlhdCI6MTc1OTMzNTIzMywianRpIjoidHJydGNjOjZjMjAzNTcyLWQzOTctMzMyNi1lYmY4LTRhNDJkY2U0YzYwMiIsImlzcyI6Imh0dHA6Ly8xMjcuMC4wLjE6ODA4MS9yZWFsbXMvcGljbWEiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiYTk1NGZlNDgtYWYxNy00MjcwLWE0NWUtNjQ4ZmY3Nzc5YmZlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYmFvdmlldC1pbnN1cmVyIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJkZWZhdWx0LXJvbGVzLXBpY21hIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbIm1hbmFnZS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE3Mi4xOC4wLjEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC1iYW92aWV0LWluc3VyZXIiLCJjbGllbnRBZGRyZXNzIjoiMTcyLjE4LjAuMSIsImNsaWVudF9pZCI6ImJhb3ZpZXQtaW5zdXJlciJ9.hnX0L7fmib8k4YdMURZtuHUdaWw_NgsoBOZI3ACPZTxA157nn58bDYZ74LrDNDa_F7FGDk5P0yxzx8MhTlE-7E4xOv4tzmSBffijwfSPHHXpnpSCZ3x8g3dBO3WwNHIYnHfMb0yHcY_94XM1hssoo_W9gmpKzAmvkdog2L8ESQK3j0642P7G-GtrNzuU9kXTVLI_6yPoUCrHYqPFNcRd06BHc9CdmQlugDmWRYZqhNFjrxydilOjfSdj5oSypNMTwFs0vPCACGK8ujcn2r1uLFZ_Zm3IieQbhK4VC8RT_x4_1RS4II-TQPcjWeXjqz6kFZ5zwT0y47QSIq53NB-SMg";
    @Autowired
    private UserOutboundApi userOutboundApi;

    @Test
    void contextLoads() {
    }

    //    @Test
    public void testGetAllUsers() {
        userOutboundApi.getAllPropertyOwners(token);
    }

    @Test
    public void testCreateUser() {
        User newUser = User.builder()
                .firstName("Capy")
                .lastName("Bara")
                .email("capybara@lol.com")
                .username("capybara")
                .build();
        newUser = userOutboundApi.createUser(newUser, token);
        assertThat(newUser);
        assertThat(newUser.getUserId());
        assertThat(newUser.getGroupId());
    }
}