package edu.hcmute;

import edu.hcmute.models.User;
import edu.hcmute.outbound.UserOutboundApi;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class UserMgmtServiceApplicationTests {
    String token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0S2FKVEdKRWxMS0N0ZHc1SVFrOEJ6OGRCd2tmQmVnR3lEd1NZVEhOWFpJIn0.eyJleHAiOjE3NTkzMzEyMTQsImlhdCI6MTc1OTMyOTQxNCwianRpIjoidHJydGNjOjU1N2Y2MWE1LTY1ZWEtODA1OC1hMDRhLTQ0YzFjNjhlZWRiNSIsImlzcyI6Imh0dHA6Ly8xMjcuMC4wLjE6ODA4MS9yZWFsbXMvcGljbWEiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiYTk1NGZlNDgtYWYxNy00MjcwLWE0NWUtNjQ4ZmY3Nzc5YmZlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiYmFvdmlldC1pbnN1cmVyIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyIvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJkZWZhdWx0LXJvbGVzLXBpY21hIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbIm1hbmFnZS11c2VycyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJwcm9maWxlIGVtYWlsIiwiY2xpZW50SG9zdCI6IjE3Mi4xOC4wLjEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC1iYW92aWV0LWluc3VyZXIiLCJjbGllbnRBZGRyZXNzIjoiMTcyLjE4LjAuMSIsImNsaWVudF9pZCI6ImJhb3ZpZXQtaW5zdXJlciJ9.OntC5hEbK6i1zqb-WKxGurtw2OiKM6j7v2b0ZnVLmvK_XYvzunii-dLa6y9w0iv5pf_D79R9d0jOB4Kkz8x00ZKT7YNuL3Ol73-lSRYbkEbPHS14rmPw4z2Zmt3FxZsBxUkFahdivU9OZ_f2GAHKcmzfRk9NMNc_Y01XGydo5UUSnFpgZntp1PK5Dwf3SkabFdpZkOkFsmmbn0fHRfJ98SJyEEoIhmUh7rrdm-OQa51QHTXgypRUybX6IyjMS6IyeKLcdzP5oEWfuuoHUHlY8mOr_PLynTwASyRlorDmqSBgFdfUbbxARlB4vKt8XEB6StOm3NBN0T2p-i1nuEkCPg";
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
        User user = User.builder()
                .firstName("Capy")
                .lastName("Bara")
                .email("capybara@lol.com")
                .username("capybara")
                .build();
        userOutboundApi.createUser(user, token);
    }
}