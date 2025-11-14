package edu.hcmute.repo;

import edu.hcmute.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserAddressRepo extends JpaRepository<UserAddress, Integer> {
    @Query("SELECT ua.userId FROM UserAddress ua WHERE ua.zipCode = :zipCode")
    List<String> findUserIdsByZipCode(@Param("zipCode") String zipCode);
}