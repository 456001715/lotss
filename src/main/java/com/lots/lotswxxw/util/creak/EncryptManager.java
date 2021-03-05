package com.lots.lotswxxw.util.creak;

import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.json.JSONObject;

/**
 * @author lots
 */
public class EncryptManager {
    private static final String TAG = "EncryptManager";
    private static volatile EncryptManager instance;
    private String appKey = "scb37537f85scxpcm59f7e318b9epa51";
    private Cipher cipher;
    private String encryptKey;
    private boolean isDebug = false;
    private byte[][] key_iv;
    private SecretKeySpec skeySpec;
    private static String p1 = "7205a6c3883caf95b52db5b534e12ec3";
    private static String p2 = "81d7beac44a86f4337f534ec93328370";
    /*public static String key = "f5675cbb7e8887a705a4e6c94823d842bdea9abd51c84498c6484bc9592f41ff";
    public static String iv = "f4e540360b85e9cd70330f50955ef83f";*/
    public EncryptManager() {
        try {
            this.cipher = Cipher.getInstance("AES/CFB/NoPadding");
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            this.cipher = null;
        } catch (NoSuchPaddingException e2) {
            e2.printStackTrace();
            this.cipher = null;
        }
    }

    public static EncryptManager getInstance() {
        if (instance == null) {
            synchronized (EncryptManager.class) {
                if (instance == null) {
                    instance = new EncryptManager();
                    instance.init(p1, p2);
                }
            }
        }
        return instance;
    }

    public void init(String str, String str2) {
        this.encryptKey = str;
        this.appKey = str2;
        try {
            this.key_iv = AesCfbUtil.EVP_BytesToKey(32, 16, (byte[]) null, str.getBytes("UTF-8"), 0);
            this.skeySpec = new SecretKeySpec(this.key_iv[0], "AES");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            this.skeySpec = null;
        } catch (Exception e2) {
            e2.printStackTrace();
            this.skeySpec = null;
        }
    }

    public String encrypt(String str) {
        logInfo(str);
        if (StringUtil.isEmpty(str) || this.cipher == null || this.skeySpec == null) {
            return null;
        }
        try {
            this.cipher.init(1, this.skeySpec);
            try {
                return AesCfbUtil.byte2hex(AesCfbUtil.byteMerger(this.cipher.getIV(), this.cipher.doFinal(str.getBytes("UTF-8"))));
            } catch (BadPaddingException e) {
                e.printStackTrace();
                return null;
            } catch (IllegalBlockSizeException e2) {
                e2.printStackTrace();
                return null;
            } catch (UnsupportedEncodingException e3) {
                e3.printStackTrace();
                return null;
            }
        } catch (InvalidKeyException e4) {
            e4.printStackTrace();
            return null;
        }
    }

    public String decrypt(String str) {
        logInfo(str);
        if (StringUtil.isEmpty(str) || this.cipher == null || this.skeySpec == null) {
            return null;
        }
        byte[] hex2byte = AesCfbUtil.hex2byte(str);
        byte[] copyOfRange = Arrays.copyOfRange(hex2byte, 0, 16);
        byte[] copyOfRange2 = Arrays.copyOfRange(hex2byte, 16, hex2byte.length);
        try {
            this.cipher.init(2, this.skeySpec, new IvParameterSpec(copyOfRange));
            String str2 = new String(this.cipher.doFinal(copyOfRange2), "UTF-8");
            logInfo(str2);
            return str2;
        } catch (InvalidAlgorithmParameterException e) {
            e.printStackTrace();
            return null;
        } catch (InvalidKeyException e2) {
            e2.printStackTrace();
            return null;
        } catch (BadPaddingException e3) {
            e3.printStackTrace();
            return null;
        } catch (UnsupportedEncodingException e4) {
            e4.printStackTrace();
            return null;
        } catch (IllegalBlockSizeException e5) {
            e5.printStackTrace();
            return null;
        }
    }

    public String getRequestJson(String str){
        JSONObject jSONObject = new JSONObject();
        String secondTime = TimeUtil.getSecondTime();
        String encrypt = encrypt(str);
        String md5 = getMd5(AesCfbUtil.getSHA256StrJava("data=" + encrypt + "&timestamp=" + secondTime + this.appKey));
        jSONObject.put("timestamp", secondTime);
        jSONObject.put("data", encrypt);
        jSONObject.put("sign", md5);
        return jSONObject.toString();
    }

    public String getReusltJson(String str) {
        JSONObject jSONObject = new JSONObject(str);
        if (jSONObject == null) {
            return null;
        }
        String optString = jSONObject.optString("data");
        if (StringUtil.isEmpty(optString)) {
            return null;
        }
        return decrypt(optString);
    }

    private String getMd5(String str) {
        if (StringUtil.isEmpty(str)) {
            return null;
        }
        logInfo(str);
        return MD5Util.getMD5(str);
    }

    public boolean isCanEncrypt() {
        return !StringUtil.isEmpty(this.encryptKey) && !StringUtil.isEmpty(this.appKey);
    }

    private void logInfo(String str) {
//        PrintStream printStream = System.out;
//        printStream.print(TAG + " log=" + str);
    }

    public static void main(String[] args) {

        EncryptManager em= new EncryptManager();

        String date = "BAFA4E92CA8502D3844AF211E52656610E01EBAFADACAC0C37B7388B9AEAB7A3650E605B96D48A24FF373A79FA2F5D15F02D78250575886503622FDEFC2DBD0F126F13ADC65ED3D7E84546BFB7E13F10D05EF988A1D4550A90F97374B02CA917111C176B5E1FEF6A561E6BB70D41A159A86DEDF59A4AA9E7D0CA8B7CCE9EEB85744CB23FB7F351DC0D4C748AAB9DF81DE938313728FA0AEB7BDA561D2AA21EEBC29FA83AA505BDD1A11EFF7ED3B087FAE85221D9F5D741186C49C133E815BC0AC2454D834D42E61E45FA8845981F298979D9902EEB664C930CB6B228A52215C194B70656209FC312DA65D7221DE21BF1AF8B75320629F28D231EB551D6F98D3311DA37D69ECDBC49A6870DDAE5D089C1949F961FCEBC1BB29930EE809EF5D3E9FA87B0B06D15BF1E49BEBF8929873DBAC48405ECEDF0259188A96B316C0CA6E59D9FDAB40732A80F93344D0ED481AC7CC51B1474F44261363EE53A6E2C2D806835673A275AD879DBCFEC4B3E535890E96224CE5691C90F6568F2ECB9063430A8C1762AB280D87CD97F5BD536C3480280B83C8633AA6538A160A1EDE0083139F8A58B8E9E4D1523090B655EC31E5AC6A74672090FF9969128EEF8358359EEA4D7122B809DDF764CDDF600EBF8F6A94BE43B5451271E0EA53476EB0104560712C09A2299B012912150784CD85A87CFB0AF18B3D0DA1F721BDA0212D8BD9C0F85974E65F1B33E9FDCA802FCF0DA177F447BFBF40B126F71B03087E03FA357B3352959217A71B4824CED111D4C1799A987C06DB9BD9A17203279A26AA1690705814FED1283E45F8D97";
        String date1 = "F4E540360B85E9CD70330F50955EF83FAC16D29A4E7D6784B976D643DCDBEDB6D90E8A59661354F1DAADC690AE9ACD1ED8959FA0432D5DDB33E6CF5EF4B5000BCE1CDB41D578F22B3ACEC849EAB2CFA2F6949791CDF9603960BC63CF246716F58A1E78048516CD29B7EAC05AD8B05AACB7400F0FB0223A69FD599C067BE20A07404BE741B8EDAE2CDAACE70D0582FC4C4AC9CFBEB4B89A66E7E7E5D1233E0CD37432160D65CC0256B8108C3C9BB033AAE2B04B219366B64E615484D5A6662530A5895C1C1CC559C1B373761F9AAB801D450A65209E332E51BE63DB69F7C14351FCE877DD6B608ECE7710713014B86AD66E86CF673C476690B42D9283B4521AD59AB73E59BC8C0E11A9CB97F9F16EAD01686CA20F0E6347DA3E705B80F44ED080C7AE3D4C399A2C8F890E06F83EF80B3E2F7361A8CCE7F01428D8B091B9AF8449839CF26B24FBAA4C3C2BFC049D675A26F9B71D1FF9E1A70EEBBC8D790EF5131BF698E0A6D04443BC48BFB1B1B6BDD0902289A5290CCA4F5A797D4495386B1A448F41910E82D36099E128584EA5B73B4D31405F9D3F3CB70E2EB24041FC302C832D5C40153E781059C1E6E4932A3ACFB107472E55091C6E9CA85F82EBF28D570C5C6BB5290987F8E5C73492F4A56CE6EBE17EB7F1E4ED742230143434C7DC4F6C412594AE20480177B00A7E73891CEED000DF336B5B042C46EE9ECB746F067277A00F42B33308757AE94679A73DD53732C3AC0F3C45FC7B62B9B5533DE582F2808B1E12DF7651D499126BFB2968B04A2E23389A41BCB554183314ACB5B4A94DFAE9940902A5A6B09000A545FBA5637BBFE586D1FE1E74C5D12D85DE4FE917345387B50E270E77399EC12F51DB8B8FD5CDE3AE1023B4CDD76318B26E17DD6D8F93CF60F2ECC02AD659CCBB6D829A2822C18B5F6C8180980943B3957EBD13E4AE1E12D4866C378F75AAA52EF06BF486F6FC009CC65432C40D81B0418B908EE5EE9F4EA18205151F95234362ED18C0EF87B5D3DDB6623DC69B7C68272E7D5432EE2ABF7984DFB3829865FE00AC7D944E55601541331C87B10090B61231F07CDFDB76E72DC7565899AEE9EEEAD9BEFAB21EC75FAD725E7AC23D120CF4A2A3C70E665224B90F7524C0A899C5317D8EF415D39E778547485C9D8428C58A2D9ECF5189EB9F1BC15AA4EE0B34DA111297583407255547F4E4DD6141AABBD5F2080DDAC37C64DAB8538DF6DC122B3D1DC6E73E3B803E84177707DEBEC22517BE42A75882D73CA3F39AE1771F4E8E1486A251A16A02EBB7C8CC44E67C74E6A700E40DEC539DEF9137A97E5675FB634EA2DC25D94353968F97163841B726E96F3D3124994E090196BB3AD1B0602D8359CC0FB73D9361C2F37610AF294AADBD455E6956847E986D368962BBB07652EE9FBF91E719804C694520631B0B464D47F876A9531AD11AFB42F25EEE9694700624479D7FCC7F7901530564D35614A9D390B53B53703B6BE41A539E6D2C88AA16FA90BFA8D4FC8119A7D9F97F3C56310618FB77FDB5978AD45A2865AE774176EBF523D03C66B85B32E1403E849020E68C4480C1B10687A9AFAAD08B307518BEEFA04F1EAB71656AC174E9051D9DBDE77A4DAE68684E2E6A04896E92FCC9CE78335DDC1A7A1B9E8C784778D7AAAABFD9377C72F22E8CBF4BE966007440BBC7EAF0B5D66E8DB5F20721A7DDD13D453E4D9A214BDC164CC11A37D430763E01F8C6E8D32B8D3D85B156180B023C6ABB80039E53F1737D570266DEAE0A0F6D89F2A4E85436364244A463EE7399AD9662850D625BE194717507FDFCCBAC17D9B877C757E70673905DCEB805D9F1F4AC191CB720309A28B6DBC9EDB94B1D9FD4C9FEF968C528BC0DC2949BB22FC98B0F2F691D45A2954FAF399B672710B73DBD02D6CC406B853630323757F9B44548E7172C47A2E72527AFD7A696D7300E51B56894EAAF2CDC628907315893986275B5CB73E3E2A9E4875532F320572333823D057B29E14F466509A80D155C108C7ADDC82CAF98BAD13D10C876CC9EF9673531BBDE89265291BD58D83DCF710DB3A9D23B1C283638FC8870E67787F4F92DC0A962FBA85ECDFC723E245BAE590E7AF17AEAF2F76FDEC2C97F550CB5653068C941122FEE78F719B2F58B0C1197C675B354BE11D2A1BEEA870D3B6011ABE319FF8CD942BE59867A54E5B6FC8A2496816298A340D680C537891552EA231A3A24497EE3F2933354FE14FBAC50FD34FF2A293E7D4CA3A9489457CDCB3C72F03175441529D4B01A2137F6935F6908B948E9CC8E7007049175180FFBB6FBEF96B57B3BEFF0FCA49F90E372D82B1ECFD872E091806084CBF5E3E700F51EA2527121BAEA1812A209B10FE843AFC0FCAB5BC841F9F3F6699DCAE2AC1D0CECDED3BA752570D9791AFEAC34BF697C316BFCDDC8F1BE134EA9DB8732812DA9428BF5D210FB761B9B93D6052686ACDDE4E85B661CDDD425727A5DC862779A2CA9858863A180DBDAB76F66FD5B2AAE745745145AE011AB8999E8DEF9B24BAEC063BFC05AF61446F1C762E5660AA60E1BBAD64525AC6927D65F67BF0192B8FF6FE6F55C593156221D5547E7388D65FBEAFDA359422467353F825692707FDCE26FB5A69401F57E8F00837103916E4E86DFA0D7DED6E29FFF7959579477E59BD88BB88B0B41FDF39FBE4C019466775F827B6AE224AEC8CAAA08CFD737D32CA64730D4FB6EA0E798BE0FBE3DA182E2D869B866C13475F808FE017F02D53D2115E7D434D9EFFA526A53F07F2BF76FFD910BAD804BB7C8F6511E77A3053DC1AD3D605E397300169A81966CA412A5795ADC2ED1A9CC50590D8296F8D5732B4047C350C5C32973605C28D9844268A2421879019BD11DE6880E9C893D7A9F40C649B09A9B893BC7A14EC57B2A08D871B9038B0EDA4E3CCA7A52B87AE1B15743DA6772A7BC58B67D1B1165E57635D718CA0BE0F9DE70BAA82B63D9576E87156B0D1D6029B7A60674A5F5F51860FCCE7CE5A81CA5E2B673389165916A5B6A789B14D6FF69428CA308918A2F5B4509FEAF0F3A6DE34AEF959B23650B7E85DE8628054F3CB98759649E7C9E781D8C9AF59E1A23C5F51FBDB16DCB081BF09562AA146E361658A85E5498D9FB7175F785C5B5B73AA3EBD8382F7C0C3244518B76F141F0D0120E6CB9E3CFF7CB6DE6F318DA3F821BE4C376A7A57F446CA6C714DFF882009B1D0800B0";
        String data2 = "2480FEC992B5527C75CF484C1417651BCD50EF85B4B88B4FF3DDFA5BF37387EB95B0C3BA3297FAD74E0354EFEE4C958EF640A2636BF132C8FE59FE6218C5D9219858CC16D6088C6ACE30A0BEF2CA9DA273DDA24EF8B913B8C2912283F467EEA9230069D5CE9F8F8BD2652EDB14724042B6C83BF74A39F9B154FB54989649310BAC832EDA30671E49B1002A4E14945309CC1EC53736134FD386A87B8859142A5A84A0B3040EAF25973E37C868867F75103C28A5DB783F81D827F9BCFCFED6EA90FFAD25AB790B9F12BEC5C7D28ED11FE4D793A9B53A9714FEE37E4CAB76DEC74E31DDC9A003FB4BBA66E219F2D6ABA93E4EB17F20D5D4F4BCE97703539FD5664B175AB4D178E72541B5327BE03AC43904D663A27F6D1AF81837E82430E770CEA3FCE60C9F94C5A329BBAA75B175D626FE5B737567F88A365143597125DD9BF2ADF719F96F21B80C6C16A90F0A06C19F4BE12CE9FC602E89FB01E1042DB29D18AC9770ED8E521EA2D3737CDFFD97F2AC03BD5B3AC63C0C3B53B942354A96700694A8A71922270103E0858445502A4828F100DD9EECEEA254E070EF55EB11153626218DA8FCC7DD24DC718F2EB145ABC8A7FD84D0737F22A8605C88BD83A8D2F70B8902526C7E77B14DCD81E133AAF746CD6C2D65100591936BE3366F0C050DA47A925B75F317C361577827AC3541F0F35F4B0F8DCFF809B424C619260A9FA2D8B728037A339503F5D0FC3DD069EEA40D62E5C5F0B7D2E5D249C99823E272DB297768A669E512CDA2AA4BE4840BC78191F59C7F170940BEA696EA0549BA99A842F9BE4AEA260990DC35F1F0617B7EE470B298138575996DC286C320F43CF5A2E431F2002FFBDC9B28E8958C14B4117BDC2043261CB28732147DE535F99CCBA3CF40E91D991A62C9A831E10C5EC1E970091B3BF0BA6C0CA96070B59424054FFF1D48DA4E387E090A51538E606F1C4EED62539791D23E18133170F7ABF5A333E998D5E6B9BFB71AD178D835C03D04368CAC158AB53FB50BFA1CC9A82DBBD91252BDB860B27581B3F5B0939713165839A913382148B8ED207681EF7AF40E88EF5C0BB13A607C576890C96BB245A946F92F76E386AF5695321FF3B688E80B1CB5FC947381D5DEB0D03596CA39E6618DA179461BF1B135CAB21F1D087A2D832AFE35DE5ED0248B8F9826B8D7F4E7B8565C371E0BA0191253A16652B57DE19FD24B1E2770B9630E0F60916792C86A37DF8EBD5939C7379C3BC53331D212FD5C23EF00C172F97353D9FD12C6A0CF81F2003DA51905830097FB58D393CD2DF8BB562032E7677104B7A93616EA45F96CF3BC5636EE656B23FD20595C0D0699BC3A1FB15B546C370DBA669E02D7BFA28C77541E319391852CD82ABCE650DE16D664B7CBA125771342579B6C15D8F08A6EFCCC42B0B8E2551C47FA9E161CA6314FEC73E2979B659655EC00A357AA0506C96BEEA38541E05A7936745FA52F0D305373B154D9127C79BA31BC6D895F07DD2021844E4F5641A60908EF243F658C7E35458B0FC4628607CA4FF33D78";
        em.init(p1,p2);
        final String decrypt2 = em.decrypt(data2);
        System.out.println(decrypt2);
        final String decrypt1 = em.decrypt(date);
        System.out.println(decrypt1);

    }
}