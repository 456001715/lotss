package com.lots.lotswxxw.controller;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.lots.lotswxxw.dao.ListenHisoryDao;
import com.lots.lotswxxw.domain.po.GetTwoPO;
import com.lots.lotswxxw.domain.po.ListenHisoryEntity;
import com.lots.lotswxxw.domain.vo.JsonResult;
import com.lots.lotswxxw.domain.vo.music.JsonRootBean;
import com.lots.lotswxxw.domain.vo.music.WeekData;
import com.lots.lotswxxw.service.GetService;
import com.lots.lotswxxw.util.CloudMusicApiUrl;
import com.lots.lotswxxw.util.CreateWebRequest;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.*;


/**
 * @author: lots
 * @date: 2020/4/21 17:51
 * @description:
 */
@RestController
@RequestMapping("get")
public class GetController {
    @Resource
    private GetService getService;


    //todo 定时刷新
    @GetMapping("two")
    public JsonResult getTwo() {
        return getService.getTwo();
    }

    @PostMapping("buyTwo")
    public JsonResult getBuyTwo(@RequestBody GetTwoPO get) {
        return getService.buyTwo(get);
    }

    @GetMapping("music")
    public JsonResult getMusic(String id, String type) {
        return getService.getMusic(id, type);
    }

    @GetMapping("musicPage")
    public JsonResult getMusicPage() {
        return getService.getMusicPage();
    }

    @GetMapping("port")
    public JsonResult getPort(@RequestParam("ip") String ip, @RequestParam("start") Integer start, @RequestParam("end") Integer end) {
        return getService.getPort(ip, start, end);
    }

    /**
    * GetController 发送邮件
    * @author: lots
    * @param txt: 
    * @return: com.lots.lotswxxw.domain.vo.JsonResult
    * @date: 2021/4/9 9:44
    */
    @GetMapping("sendMail")
    public JsonResult sendMail(String txt) {
        return getService.sendMail(txt);
    }

}
